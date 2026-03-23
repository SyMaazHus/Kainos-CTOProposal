from authenticator.graph_api_token import get_graph_token
from .graph_files import list_files, create_folder, download_file, upload_file, move_file
from .ai_parser import parse_file_action_with_ai 
import os

def handle_files(intent: str, user_input: str):
    try:
        token = get_graph_token()
        if not token:
            return "❌ Login failed."

        # Parse once at the top for all intents that need params
        data = parse_file_action_with_ai(user_input)

        if intent == "list_files":
            files = list_files(token, recursive=True)
            if not files:
                return "Your OneDrive is empty."
            file_context = "SYSTEM DATA: User Files\n\n"
            for f in files:
                name = f.get("name", "Unknown")
                parent = f.get("parentReference", {}).get("path", "")
                parent_clean = parent.replace("/drive/root:", "").strip("/")
                label = "[Folder]" if "folder" in f else "[File]"
                path_display = f"{parent_clean}/{name}" if parent_clean else name
                file_context += f"{label} {path_display}\n"
            return file_context

        elif intent == "create_folder":
            folder_name = data.get("folder_name", "").strip() 
            if not folder_name:
                return "❌ Couldn't detect folder name."
            create_folder(token, folder_name)
            return f"✅ Folder created: {folder_name}"

        elif intent == "download_file":
            file_name = data.get("file_name", "").strip()  
            if not file_name:
                return "❌ Couldn't detect file name."
            files = list_files(token, recursive=True)
            file_id = next((f["id"] for f in files if f.get("name","").lower() == file_name.lower()), None)
            if not file_id:
                return f"❌ File '{file_name}' not found."
            os.makedirs("./downloads", exist_ok=True)
            download_file(token, file_id, f"./downloads/{file_name}")
            return f"✅ Downloaded to ./downloads/{file_name}"

        elif intent == "upload_file":
            local_path = data.get("local_path", "").strip()  
            remote_name = data.get("remote_name", local_path).strip()
            if not local_path or not os.path.exists(local_path):
                return f"❌ Local file not found: {local_path}"
            upload_file(token, local_path, remote_name)
            return f"✅ Uploaded as {remote_name}"

        elif intent == "move_file":
            file_name = data.get("file_name", "").strip()     
            target_folder = data.get("target_folder", "").strip()
            if not file_name or not target_folder:
                return "❌ Couldn't detect file or target folder."
            files = list_files(token, recursive=True)
            file_id = next((f["id"] for f in files if f.get("name","").lower() == file_name.lower()), None)
            folder_id = next((f["id"] for f in files if f.get("name","").lower() == target_folder.lower()), None)
            if not file_id:
                return f"❌ File '{file_name}' not found."
            if not folder_id:
                return f"❌ Folder '{target_folder}' not found."
            move_file(token, file_id, folder_id)
            return f"✅ '{file_name}' moved to '{target_folder}'"

        return "❌ Unsupported file operation."

    except Exception as e:
        return f"❌ File operation failed: {e}"
