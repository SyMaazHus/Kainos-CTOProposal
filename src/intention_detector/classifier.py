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

Return JSON only:
{{
  "intent": "...",
  "confidence": 0-1
}}

Only classify as create_meeting if explicitly requesting an action.

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