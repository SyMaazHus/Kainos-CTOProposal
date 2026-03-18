from authenticator.graph_api_token import get_graph_token
from .graph_files import list_files, create_folder, download_file, upload_file, move_file
import os
from .ai_parser import parse_file_action_with_ai

def handle_files(intent: str,user_input: str):
    try:
        token = get_graph_token()

        if not token:
            return "❌ Login failed."

        # ---------------- LIST FILES ----------------
        if intent == "list_files":

            files = list_files(token)

            if not files:
                return "Your OneDrive is empty."
            
            file_context = "SYSTEM DATA: User Files\n\n"

            for f in files:
                name = f.get("name", "Unknown file")
                file_context += f"- {name}\n"

            return file_context


        # ---------------- CREATE FOLDER ----------------
        elif intent == "create_folder":

            parts = user_input.split("folder", 1)
            folder_name = parts[1].strip() if len(parts) > 1 else ""

            if not folder_name:
                return "I understood you want a folder, but I couldn't detect the folder name."

            create_folder(token, folder_name)

            return f"✅ Folder created: {folder_name}"

        # ---------------- DOWNLOAD FILE ----------------
        elif intent == "download_file":

            parts = user_input.split("file", 1)
            file_id = parts[1].strip() if len(parts) > 1 else ""

            if not file_id:
                return "Please tell me the file ID to download."

            download_dir = "./downloads"
            os.makedirs(download_dir, exist_ok=True)

            save_path = os.path.join(download_dir, file_id)
            download_file(token, file_id, save_path)

            return f"✅ File downloaded to {save_path}"

        # ---------------- UPLOAD FILE ----------------
        elif intent == "upload_file":

            parts = user_input.split(" as ")
            if len(parts) != 2:
                return "Please specify local file and remote name (e.g., upload local.txt as remote.txt)."

            local_path = parts[0].replace("upload", "").strip()
            remote_name = parts[1].strip()

            upload_file(token, local_path, remote_name)
            return f"✅ File uploaded as {remote_name}"

        # ---------------- MOVE FILE ----------------
        elif intent == "move_file":

            parts = user_input.split(" to ")
            if len(parts) != 2:
                return "Please specify file ID and target folder ID."

            file_id = parts[0].replace("move", "").strip()
            new_parent_id = parts[1].strip()

            move_file(token, file_id, new_parent_id)
            return "✅ File moved successfully."

        return "Unsupported file operation."

    except Exception as e:
        return f"❌ File operation failed: {e}"
