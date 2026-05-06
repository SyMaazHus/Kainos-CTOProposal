from backend.authenticator.graph_api_token import get_graph_token
from .graph_files import list_files, create_folder, move_file
from .ai_file_parser import parse_file_action_with_ai 
import os

def handle_files(intent: str, user_input: str):
    try:
        token = get_graph_token()
        if not token:
            return "❌ Login failed."

        # Parse once at the top for all intents that need params
        data = parse_file_action_with_ai(user_input)

        # deal with intent of list_files
        if intent == "list_files":

            folder_name = (data.get("folder_name") or "").strip() 

            # try to extract folder name
            if folder_name:
                all_files = list_files(token, recursive=False)
                folder_item = next((f for f in all_files if f.get("name", "").lower() == folder_name.lower() and "folder" in f), None)

                # get the files in the folder
                if folder_item:
                    folder_id = folder_item["id"]
                    files = list_files(token, folder_id=folder_id, recursive=False)
                    file_context = f"{folder_name} Files\n\n"
                else:
                    return f"Could not find {folder_name}\n\n"
            else:
                # list all the files
                files = list_files(token, recursive=False)
                file_context = "User Files\n\n"

                # condition for not found a file
                if not files:
                    return "Your OneDrive is empty."
            
            # label each file found in the folder
            for f in files:
                name = f.get("name", "Unknown")
                label = "[Folder]" if "folder" in f else "[File]"
                file_context += f"{label} {name}\n"

            return file_context

        # create a folder
        elif intent == "create_folder":
            folder_name = data.get("folder_name", "").strip() 
            if not folder_name:
                return "❌ Couldn't detect folder name."
            create_folder(token, folder_name)
            return f"✅ Folder created: {folder_name}"

        # move file
        elif intent == "move_file":
            # get file
            file_name = data.get("file_name", "").strip() 

            # get the folder name    
            target_folder = data.get("target_folder", "").strip()

            root_items = list_files(token, recursive=False)
            search_items = list_files(token, recursive=True)
            all_items = root_items + search_items

            # get the information of move to file
            file_item = next((f for f in all_items if f.get("name", "").lower() == file_name.lower() and "folder" not in f), None)
            folder_item = next((f for f in all_items if f.get("name", "").lower() == target_folder.lower() and "folder" in f), None)

            if not file_name or not target_folder:
                return "❌ Couldn't detect file or target folder."
            
            move_file(token, file_item["id"], folder_item["id"])
            return f"✅ '{file_name}' moved to '{target_folder}'"

        return "❌ Unsupported file operation."

    except Exception as e:
        return f"❌ File operation failed: {e}"
