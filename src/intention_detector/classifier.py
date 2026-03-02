import json
from dotenv import load_dotenv
import os
from groq import Groq

#Load API Key from .env
load_dotenv()
api_key = os.getenv("GROQ_API_KEY")

#Setup Groq Client
client = Groq(api_key=api_key)

def detect_intent(user_input: str):
    prompt = f"""
You are an intent classifier.

Possible intents:
- create_meeting
- read_email
- normal_chat
- list_files
- create_folder
- download_file
- upload_file
- move_file

Return JSON only:
{{
  "intent": "...",
  "confidence": 0-1
}}

Rules:
- classify as create_meeting ONLY if user is explicitly asking to schedule/create a meeting.
- classify as read_email ONLY if user is explicitly asking to read/check emails/inbox.
- classify as list_files if user asks to list/show/view files or documents.
- classify as create_folder if user asks to create/make a folder/directory.
- classify as download_file if user asks to download/get a file (usually mentions a filename).
- otherwise normal_chat.

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
        return data
    except:
        return {"intent": "normal_chat", "confidence": 0}