import sys
import os
from authenticator.graph_api_token import get_graph_token
from graph_files import list_files, create_folder, download_file

def handle_files_from_text(user_input: str):
    text = user_input.lower()

    # LIST
    if "list" in text and ("file" in text or "files" in text):
        token = get_graph_token()
        files = list_files(token)
        if not files:
            return "No files found."
        return "\n".join([f["name"] for f in files])

    # CREATE FOLDER
    if "create folder" in text or "make folder" in text:
        # very basic extraction: create folder X
        parts = user_input.split("folder", 1)
        folder_name = parts[1].strip() if len(parts) > 1 else ""
        if not folder_name:
            return "I understood you want a folder, but I couldn't detect the folder name."

        token = get_graph_token()
        create_folder(token, folder_name)
        return f"✅ Folder created: {folder_name}"

    # DOWNLOAD (you would need file_id, so usually you list first then ask user)
    if "download" in text:
        return "To download, please tell me the file name (or ID)."

    return None
