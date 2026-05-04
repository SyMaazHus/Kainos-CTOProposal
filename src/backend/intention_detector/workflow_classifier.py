import json
from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def detect_workflow_intent(user_input: str):
    prompt = f"""
You are a workflow intent classifier and rule extractor.

Possible intents:
- summarize_note
- organize_files
- unknown

Return JSON only:
{{
  "intent": "summarize_note",
  "confidence": 0.9,
  "rule": {{
    "source": "onenote",
    "operation": "summarize",
    "criteria": "meeting notes",
    "destination": "OneNote summary page"
  }}
}}

Rules:
- Use summarize_note if the user wants to summarise notes.
- Use organize_files if the user wants to organize, sort, move, rename, or group OneDrive files.
- Use unknown if unsupported.
- For summarize_note, source should usually be "onenote".
- For organize_files, source should usually be "onedrive".
- criteria should describe what files/pages should be selected.
- destination should describe where the result should go.
- Return only valid JSON.

User input:
{user_input}
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0
    )

    content = response.choices[0].message.content.strip()

    try:
        data = json.loads(content)
        intent = data.get("intent", "unknown")
        confidence = float(data.get("confidence", 0))

        if intent not in ["summarize_note", "organize_files", "unknown"]:
            intent = "unknown"

        return {
            "intent": data.get("intent", "unknown"),
            "confidence": float(data.get("confidence", 0)),
            "rule": data.get("rule", {})
        }
    except Exception:
        return {"intent": "unknown", "confidence": 0}