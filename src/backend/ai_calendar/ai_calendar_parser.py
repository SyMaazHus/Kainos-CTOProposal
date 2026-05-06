from groq import Groq
import os
import json
import re

client = Groq(api_key=os.getenv("GROQ_API_KEY")) #fetch the Azure client ID

def parse_meeting_with_ai(user_input: str):
    """
    Use Groq AI to extract meeting info from natural language
    """

    prompt = f"""
Extract meeting information from the following request.

Return JSON only.

Current date and time (Europe/London): {__import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M')}

IMPORTANT TIME RULES:
1. User input times are in Europe/London local time (BST/UTC+1 during summer, GMT/UTC+0 during winter)
2. Return start_datetime and end_datetime as Europe/London local time in ISO 8601 format (YYYY-MM-DDTHH:MM:SS)
3. DO NOT convert to UTC - keep the original local time as provided by the user
4. If the user only says a time (e.g. "5pm"), assume it means today unless already past, then tomorrow
5. If no end time is specified, assume the meeting lasts 1 hour
6. For delete_meeting intent, if time is unclear, you may omit start_datetime/end_datetime

Return this exact JSON structure:
{{
    "intent": "create_meeting" or "delete_meeting",
    "title": "meeting title (short, required for create, optional for delete), If the user does not provide a specific subject, set this to 'Meeting'",
    "start_datetime": "YYYY-MM-DDTHH:MM:SS (Europe/London local time, required for create, optional for delete)",
    "end_datetime": "YYYY-MM-DDTHH:MM:SS (Europe/London local time, required for create, optional for delete)",
    "attendees": ["email1@example.com", "email2@example.com"],
    "timezone": "Europe/London"
}}

Examples (Europe/London local time):
- "create a meeting tomorrow at 3pm" → start_datetime: "2026-05-03T15:00:00" (local time, NOT UTC)
- "delete my meeting at 2pm" → intent: "delete_meeting", title: "", start_datetime: "2026-05-02T14:00:00"
- "delete the team sync meeting" → intent: "delete_meeting", title: "team sync"

User request:
{user_input}
"""
    # Send request to Groq LLM for intent + information extraction
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0
    )

    # Extract raw text response from model
    content = response.choices[0].message.content.strip()

    # Clean markdown formatting
    content = re.sub(r"```json|```", "", content).strip()

    # Convert JSON string into Python dictionary
    return json.loads(content)