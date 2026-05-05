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
- send_email
- search_email
- normal_chat
- list_files
- create_folder
- download_file
- upload_file
- move_file
- delete meeting
- list_notebooks
- find_note
- take_note
- create_notebook
- create_section
- list_sections
- list_pages

Return JSON only:
{{
  "intent": "...",
  "confidence": 0-1
}}

Rules:
- classify as create_meeting ONLY if user is explicitly asking to schedule/create a meeting.
- classify as read_email ONLY for general requests to see the inbox, check latest mail, or "list emails" without a specific topic.
- classify as send_email ONLY if the user asks to send and email.
- classify as search_email ONLY if the user provides a specific keyword, person, or category to find (e.g., "Find emails from Nottingham", "Search for meeting notes").
- classify as list_files if user asks to list/show/view files or documents.
- classify as create_folder if user asks to create/make a folder/directory.
- classify as download_file if user asks to download/get a file (usually mentions a filename).
- classify as list_notebooks if the user wants to see their OneNote notebooks
- list_sections: Use when user wants to see tabs/sections (e.g., "show the sections in this notebook").
- list_pages: Use when user wants to see the individual notes/pages inside a specific section.
- classify as find_note if the user is searching for a specific note, e.g., "Where is my note about X?" or "Search my notes for Y".
- create_notebook: Use ONLY if the user explicitly wants to make a new notebook (e.g., "Create a notebook called Test").
- create_section: Use if the user wants to add a new section/tab to a notebook.
- create_page: User wants to create a new note or page inside a specific section.
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