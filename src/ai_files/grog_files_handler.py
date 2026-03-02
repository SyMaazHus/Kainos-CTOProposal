import sys
import os
from authenticator.graph_api_token import get_graph_token
from graph_files import list_files, create_folder, download_file

def handle_files(intent: str,user_input: str, messages:list):
    text = user_input.lower()
    try:
        token = get_graph_token()

        if not token:
            messages.append({
                "role": "system",
                "content": "System: Login failed."
            })
            return False

        # ---------------- LIST FILES ----------------
        if intent == "list_files":

            files = list_files(token)

            if not files:
                messages.append({
                    "role": "system",
                    "content": "System Notification: No files found."
                })
            else:
                file_context = "SYSTEM DATA: User Files\n\n"

                for f in files:
                    name = f.get("name", "Unknown file")
                    file_context += f"- {name}\n"

                messages.append({
                    "role": "system",
                    "content": file_context
                })

            return True

        # ---------------- CREATE FOLDER ----------------
        elif intent == "create_folder":

            parts = user_input.split("folder", 1)
            folder_name = parts[1].strip() if len(parts) > 1 else ""

            if not folder_name:
                messages.append({
                    "role": "system",
                    "content": "I understood you want a folder, but I couldn't detect the folder name."
                })
                return False

            create_folder(token, folder_name)

            messages.append({
                "role": "system",
                "content": f"✅ Folder created: {folder_name}"
            })

            return True

        # ---------------- DOWNLOAD FILE ----------------
        elif intent == "download_file":

            messages.append({
                "role": "system",
                "content": "To download, please tell me the file name (or ID)."
            })

            return True

        return False

    except Exception as e:
        print(f"Files Handler Error: {e}")
        messages.append({
            "role": "system",
            "content": f"Error: {e}"
        })
        return False