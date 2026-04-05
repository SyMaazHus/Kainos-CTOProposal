from authenticator.graph_api_token import get_graph_token
from .graph_files import list_files, create_folder, move_file
# from .graph_files import download_file, upload_file
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

            folder_name = (data.get("folder_name") or "").strip() 

            if folder_name:
                all_files = list_files(token, recursive=False)
                folder_item = next((f for f in all_files if f.get("name", "").lower() == folder_name.lower() and "folder" in f), None)

                if folder_item:
                    folder_id = folder_item["id"]
                    files = list_files(token, folder_id=folder_id, recursive=False)
                    file_context = f"{folder_name} Files\n\n"
                else:
                    return f"Could not find {folder_name}\n\n"
            else:
                files = list_files(token, recursive=False)
                file_context = "User Files\n\n"

                if not files:
                    return "Your OneDrive is empty."
                
            for f in files:
                name = f.get("name", "Unknown")
                label = "[Folder]" if "folder" in f else "[File]"
                file_context += f"{label} {name}\n"

            return file_context

        elif intent == "create_folder":
            folder_name = data.get("folder_name", "").strip() 
            if not folder_name:
                return "❌ Couldn't detect folder name."
            create_folder(token, folder_name)
            return f"✅ Folder created: {folder_name}"

        # elif intent == "download_file":
        #     file_name = data.get("file_name", "").strip()  
        #     if not file_name:
        #         return "❌ Couldn't detect file name."
        #     files = list_files(token, recursive=True)
        #     file_id = next((f["id"] for f in files if f.get("name","").lower() == file_name.lower()), None)
        #     if not file_id:
        #         return f"❌ File '{file_name}' not found."
        #     os.makedirs("./downloads", exist_ok=True)
        #     download_file(token, file_id, f"./downloads/{file_name}")
        #     return f"✅ Downloaded to ./downloads/{file_name}"

        # elif intent == "upload_file":
        #     local_path = data.get("local_path", "").strip()  
        #     remote_name = data.get("remote_name", local_path).strip()
        #     if not local_path or not os.path.exists(local_path):
        #         return f"❌ Local file not found: {local_path}"
        #     upload_file(token, local_path, remote_name)
        #     return f"✅ Uploaded as {remote_name}"

        elif intent == "move_file":
            file_name = data.get("file_name", "").strip()     
            target_folder = data.get("target_folder", "").strip()

            root_items = list_files(token, recursive=False)
            search_items = list_files(token, recursive=True)
            all_items = root_items + search_items

            file_item = next((f for f in all_items if f.get("name", "").lower() == file_name.lower() and "folder" not in f), None)
            folder_item = next((f for f in all_items if f.get("name", "").lower() == target_folder.lower() and "folder" in f), None)

            if not file_name or not target_folder:
                return "❌ Couldn't detect file or target folder."
            
            move_file(token, file_item["id"], folder_item["id"])
            return f"✅ '{file_name}' moved to '{target_folder}'"

        return "❌ Unsupported file operation."

    except Exception as e:
        return f"❌ File operation failed: {e}"
