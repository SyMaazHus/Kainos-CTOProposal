from groq import Groq
import os
import json
import re

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def parse_meeting_with_ai(user_input: str):
    """
    Use Groq AI to extract meeting info from natural language
    """

    prompt = f"""
Extract meeting information from the following request.

Return JSON only.

If the user only says a time (e.g. 5pm),
assume it means today unless already past, then tomorrow.

Fields:
intent: create_meeting or delete_meeting
title: meeting title (short)
time: time expression
attendees: list of emails (empty list if none)

User request:
{user_input}
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0
    )

    content = response.choices[0].message.content.strip()

    content = re.sub(r"```json|```", "", content).strip()

    return json.loads(content)