import sys
import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from groq import Groq
from dotenv import load_dotenv
from backend.ai_email.groq_email_handler import handle_email
from backend.ai_files.groq_files_handler import handle_files
from backend.ai_calendar.groq_calendar_handler import create_meeting_from_text, delete_meeting_from_text
from backend.ai_calendar.graph_calendar import get_calendar_events
from backend.intention_detector.classifier import detect_intent
from backend.intention_detector.workflow_classifier import detect_workflow_intent
from backend.ai_onenote.onenote_handler import get_recent_onenote_pages, create_summary_page
from backend.ai_files.onedrive_handler import get_root_files, move_file_to_folder
from backend.ai_feedback.ai_feedback import get_feedback
from backend.authenticator.graph_api_token import get_graph_token
from backend.ai_onenote.groq_onenote import handle_notes

# Load environment variables from .env file
load_dotenv()
api_key = os.getenv("GROQ_API_KEY")

# Create Flask backend server
app = Flask(__name__)

# Allow Electron frontend to communicate with Flask backend
CORS(app)

# Initialise Groq client for AI requests
client = Groq(api_key=api_key)


@app.route('/chat', methods=['POST'])
def chat():
    """
    Main chatbot endpoint.
    Detects user intent and routes the request to the correct service handler.
    """
    data = request.json
    user_input = data.get('messages')

    # Support both plain string input and message history format
    if isinstance(user_input, str):
        user_input_text = user_input
        messages = [{"role": "user", "content": user_input_text}]
    else:
        user_input_text = user_input[-1]['content']
        messages = user_input
    
    # Classify user intent using AI intent detector
    intent_data = detect_intent(user_input_text)
    intent = intent_data["intent"]
    confidence = intent_data["confidence"]

    # Fall back to normal chat when confidence is too low
    if confidence < 0.75:
        intent = "normal_chat"

    # Route calendar creation request
    if intent == "create_meeting":
        meeting_reply = create_meeting_from_text(user_input_text)
        return jsonify({"reply": meeting_reply})
    
    # Route calendar deletion request
    elif intent == "delete meeting":
        meeting_reply = delete_meeting_from_text(user_input_text)
        return jsonify({"reply": meeting_reply})
    
    # Route email-related intents
    elif intent in [
        "read_email",
        "send_email",
        "search_email"
    ]:
        email_reply = handle_email(intent, messages, user_input_text, client)
        if email_reply:
            return jsonify({"reply": email_reply})
        
    # Route OneNote-related intents
    elif intent in [
        "list_notebooks",
        "list_sections",
        "list_pages", 
        "find_note", 
        "create_notebook", 
        "create_section",
        "create_page"
    ]:
        notes_reply = handle_notes(intent, messages, user_input_text, client)
        if notes_reply:
            return jsonify({"reply": notes_reply})

    # Route OneDrive file-related intents
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
        # Default chatbot response for normal conversation or enriched messages
        chat_completion = client.chat.completions.create(
            messages=messages,
            model="llama-3.3-70b-versatile",
        )
        
        ai_reply = chat_completion.choices[0].message.content
        return jsonify({"reply": ai_reply})
    
    except Exception:
        # Generic fallback error response
        return jsonify({"error": "Something went wrong."}), 500
    

@app.route('/analyse-workflow', methods=['POST'])
def analyse_workflow():
    """
    Analyses a workflow description and predicts the workflow intention.
    """
    data = request.json
    user_input = data.get('description', '')

    result = detect_workflow_intent(user_input)

    return jsonify(result)


def page_matches_workflow(workflow_description, page_title, page_text):
    """
    Uses AI to decide whether a OneNote page matches a workflow rule.
    """
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

    # Ask Groq to classify whether the page belongs to the workflow
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0
    )

    content = response.choices[0].message.content.strip()

    print("Raw match response:", content, flush=True)

    try:
        # Extract JSON object from AI response
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
        # Return safe failed match if AI output is invalid
        print("Match JSON parse error:", e, flush=True)

        return {
            "matches": False,
            "confidence": 0,
            "reason": "Invalid AI response"
        }


@app.route('/summarize-latest-onenote', methods=['POST'])
def summarize_latest_onenote():
    """
    Workflow endpoint for summarising the latest matching OneNote page.
    Prevents duplicate processing using lastProcessedPageId.
    """
    data = request.json
    workflow_description = data.get("description", "")
    last_processed_page_id = data.get("lastProcessedPageId")

    # Retrieve recent OneNote pages for matching
    pages = get_recent_onenote_pages(limit=20)

    if not pages:
        return jsonify({
            "skipped": True,
            "reason": "No usable OneNote pages found"
        })

    target_page = None
    target_match = None

    # Find the first recent page that matches the workflow
    for page in pages:
        print("Checking page:", page["title"], flush=True)

        match = page_matches_workflow(
            workflow_description,
            page["title"],
            page["text"]
        )

        print("Match result:", match, flush=True)

        # Skip pages with low confidence or no match
        if not match["matches"] or match["confidence"] < 0.75:
            continue

        # Avoid summarising the same page twice
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

    # Build AI prompt for summary generation
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

    # Generate summary using Groq
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3
    )

    summary = response.choices[0].message.content

    # Save generated summary back into OneNote
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
    """
    Uses AI to decide whether a OneDrive file matches an organisation rule.
    """
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

    # Ask Groq to classify the file against the rule
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0
    )

    content = response.choices[0].message.content.strip()

    try:
        # Extract and parse JSON from AI response
        start = content.find("{")
        end = content.rfind("}") + 1
        return json.loads(content[start:end])
    except Exception:
        # Return safe failed match if parsing fails
        return {"matches": False, "confidence": 0, "reason": "Invalid AI response"}
    

@app.route('/organize-onedrive-files', methods=['POST'])
def organize_onedrive_files():
    """
    Workflow endpoint for organising OneDrive files into a target folder.
    """
    data = request.json
    rule = data.get("rule", {})

    destination = rule.get("destination", "Others")
    files = get_root_files()

    results = []

    # Check each root file against the organisation rule
    for file in files:
        match = file_matches_rule(file["name"], rule)

        # Skip files that do not clearly match
        if not match.get("matches") or float(match.get("confidence", 0)) < 0.75:
            results.append({
                "file": file["name"],
                "matched": False,
                "reason": match.get("reason")
            })
            continue

        # Move matched file to destination folder
        move_file_to_folder(file["id"], destination)

        results.append({
            "file": file["name"],
            "matched": True,
            "movedTo": destination,
            "reason": match.get("reason")
        })

    return jsonify({"results": results})


@app.route('/get_calendar_events', methods=['GET'])
def get_calendar_events_endpoint():
    """
    Returns calendar events from Microsoft Graph API in frontend-friendly format.
    """
    try:
        # Authenticate with Microsoft Graph
        token = get_graph_token()
        mode = request.args.get('mode', 'all')

        # Retrieve events using selected mode
        events = get_calendar_events(token, mode=mode)

        formatted_events = []

        # Convert Graph event response into simplified frontend format
        for event in events:
            formatted_events.append({
                "id": event.get("id"),
                "title": event.get("subject", "No Title"),
                "start": event.get("start", {}).get("dateTime"),
                "end": event.get("end", {}).get("dateTime"),
                "location": event.get("location", {}).get("displayName", ""),
                "isAllDay": event.get("isAllDay", False)
            })

        return jsonify({
            "status": "success",
            "count": len(formatted_events),
            "events": formatted_events
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    

@app.route('/get_ai_brief', methods=['POST'])
def get_ai_brief():
    """
    Generates AI feedback or a brief summary based on timetable data.
    """
    data = request.json
    time_table = data.get('time_table', [])

    brief_reply = get_feedback(time_table, client)

    return jsonify({"brief": brief_reply})


@app.route('/login', methods=['GET'])
def login_auth():
    """
    Authenticates the user with Microsoft Graph and returns access token status.
    """
    try:
        token = get_graph_token()
        return jsonify({"status": "authenticated", "token": token})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    

if __name__ == '__main__':
    # Start Flask backend server for Electron application
    print("Starting Python Server on Port 5000...")

    # Flush stdout so logs appear immediately in Electron console
    sys.stdout.flush() 
    
    app.run(host='127.0.0.1', port=5000)