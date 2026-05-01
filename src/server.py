import sys
import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from groq import Groq
from dotenv import load_dotenv
from ai_email.groq_email_handler import handle_email
from ai_files.groq_files_handler import handle_files
from ai_calendar.groq_calendar_handler import create_meeting_from_text, delete_meeting_from_text
from intention_detector.classifier import detect_intent
from intention_detector.workflow_classifier import detect_workflow_intent
from ai_onenote.onenote_handler import get_recent_onenote_pages, create_summary_page
from ai_files.onedrive_handler import get_root_files, move_file_to_folder
from ai_feedback.ai_feedback import get_feedback
from authenticator.graph_api_token import get_graph_token

#Load API Key from .env
load_dotenv()
api_key = os.getenv("GROQ_API_KEY")

#Setup Flask
app = Flask(__name__)
CORS(app) #Enables Electron to talk to Python

#Setup Groq Client
client = Groq(api_key=api_key)

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_input = data.get('messages')

    if isinstance(user_input, str):
        user_input_text = user_input
        messages = [{"role": "user", "content": user_input_text}]
    else:
        user_input_text = user_input[-1]['content']
        messages = user_input
    
    intent_data = detect_intent(user_input_text)
    intent = intent_data["intent"]
    confidence = intent_data["confidence"]

    if confidence < 0.75:
        intent = "normal_chat"

    if intent == "create_meeting":
        meeting_reply = create_meeting_from_text(user_input_text)
        return jsonify({"reply": meeting_reply})
    
    elif intent == "delete meeting":
        meeting_reply = delete_meeting_from_text(user_input_text)
        return jsonify({"reply": meeting_reply})
    
    elif intent in [
        "read_email",
        "send_email",
        "search_email"
    ]:
        email_reply = handle_email(intent, messages, user_input_text, client)
        if email_reply:
            return jsonify({"reply": email_reply})


    elif intent in [
        "list_files",
        "create_folder",
        "download_file",
        "upload_file",
        "move_file"
    ]:
        reply = handle_files(intent, user_input_text)
        return jsonify({"reply": reply})
    
    try:
        chat_completion = client.chat.completions.create(
            messages=messages,
            model="llama-3.3-70b-versatile",
        )
        
        ai_reply = chat_completion.choices[0].message.content
        return jsonify({"reply": ai_reply})
    
    except Exception:
        return jsonify({"error": "Something went wrong."}), 500
    

@app.route('/analyse-workflow', methods=['POST'])
def analyse_workflow():
    data = request.json
    user_input = data.get('description', '')

    result = detect_workflow_intent(user_input)

    return jsonify(result)

def page_matches_workflow(workflow_description, page_title, page_text):
    prompt = f"""
You are deciding whether a OneNote page should be processed by a user's workflow.

Workflow instruction:
{workflow_description}

OneNote page title:
{page_title}

OneNote page content:
{page_text[:3000]}

Return JSON only. No explanation.

Example:
{{"matches": true, "confidence": 0.9, "reason": "This is clearly a meeting note"}}

Rules:
- Only return valid JSON
- matches = true only if clearly belongs
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0
    )

    content = response.choices[0].message.content.strip()

    print("Raw match response:", content, flush=True)

    try:
        start = content.find("{")
        end = content.rfind("}") + 1

        json_text = content[start:end]

        data = json.loads(json_text)

        return {
            "matches": bool(data.get("matches", False)),
            "confidence": float(data.get("confidence", 0)),
            "reason": data.get("reason", "")
        }

    except Exception as e:
        print("Match JSON parse error:", e, flush=True)

        return {
            "matches": False,
            "confidence": 0,
            "reason": "Invalid AI response"
        }

@app.route('/summarize-latest-onenote', methods=['POST'])
def summarize_latest_onenote():
    data = request.json
    workflow_description = data.get("description", "")
    last_processed_page_id = data.get("lastProcessedPageId")

    pages = get_recent_onenote_pages(limit=20)

    if not pages:
        return jsonify({
            "skipped": True,
            "reason": "No usable OneNote pages found"
        })

    target_page = None
    target_match = None

    for page in pages:
        print("Checking page:", page["title"], flush=True)

        match = page_matches_workflow(
            workflow_description,
            page["title"],
            page["text"]
        )

        print("Match result:", match, flush=True)

        if not match["matches"] or match["confidence"] < 0.75:
            continue

        if last_processed_page_id and page["id"] == last_processed_page_id:
            print("Latest matching page already processed:", page["title"], flush=True)
            return jsonify({
                "skipped": True,
                "reason": "Latest matching page already processed",
                "sourcePageId": page["id"],
                "sourceTitle": page["title"]
            })

        target_page = page
        target_match = match
        break

    if not target_page:
        return jsonify({
            "skipped": True,
            "reason": "No matching page found for this workflow"
        })

    prompt = f"""
You are summarising a OneNote page according to the user's workflow.

Workflow instruction:
{workflow_description}

OneNote page title:
{target_page["title"]}

OneNote page content:
{target_page["text"]}

Return:
- Key points
- Decisions
- Action items
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3
    )

    summary = response.choices[0].message.content

    created = create_summary_page(target_page["title"], summary)

    return jsonify({
        "skipped": False,
        "sourcePageId": target_page["id"],
        "sourceTitle": target_page["title"],
        "match": target_match,
        "summary": summary,
        "createdPage": created
    })

def file_matches_rule(file_name, rule):
    criteria = rule.get("criteria", "")
    destination = rule.get("destination", "Others")

    prompt = f"""
Decide whether this OneDrive file matches the user's organization rule.

Rule criteria:
{criteria}

Destination folder:
{destination}

File name:
{file_name}

Return JSON only:
{{"matches": true, "confidence": 0.9, "reason": "short reason"}}

Rules:
- matches should be true only if the file clearly fits the rule criteria.
- If unsure, return matches false.
- Return valid JSON only.
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0
    )

    content = response.choices[0].message.content.strip()

    try:
        start = content.find("{")
        end = content.rfind("}") + 1
        return json.loads(content[start:end])
    except Exception:
        return {"matches": False, "confidence": 0, "reason": "Invalid AI response"}
    
@app.route('/organize-onedrive-files', methods=['POST'])
def organize_onedrive_files():
    data = request.json
    rule = data.get("rule", {})

    destination = rule.get("destination", "Others")
    files = get_root_files()

    results = []

    for file in files:
        match = file_matches_rule(file["name"], rule)

        if not match.get("matches") or float(match.get("confidence", 0)) < 0.75:
            results.append({
                "file": file["name"],
                "matched": False,
                "reason": match.get("reason")
            })
            continue

        move_file_to_folder(file["id"], destination)

        results.append({
            "file": file["name"],
            "matched": True,
            "movedTo": destination,
            "reason": match.get("reason")
        })

    return jsonify({"results": results})

@app.route('/get_ai_brief', methods=['POST'])
def get_ai_brief():
    data = request.json
    time_table = data.get('time_table', [])

    brief_reply = get_feedback(time_table, client)

    return jsonify({"brief": brief_reply})

@app.route('/login', methods=['GET'])
def login_auth():
    try:
        token = get_graph_token()
        return jsonify({"status": "authenticated", "token": token})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    
if __name__ == '__main__':
    # Flush stdout so we see prints in Electron console immediately
    print("Starting Python Server on Port 5000...")
    sys.stdout.flush() 
    app.run(host='127.0.0.1', port=5000)