from groq import Groq
import os, json, re

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def parse_file_action_with_ai(user_input: str):
    prompt = f"""Extract file operation information from the following request.
Return JSON only.

Fields:
intent: list_files, create_folder, download_file, upload_file, or move_file
folder_name: folder to create (or null)
file_name: file to download or move (or null)
local_path: local file path for upload (or null)
remote_name: remote file name for upload (or null)
target_folder: destination folder for move (or null)

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