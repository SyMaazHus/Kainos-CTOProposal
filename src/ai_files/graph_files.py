import os
import requests
import msal
from msal import PublicClientApplication 
from dotenv import load_dotenv
import json 
from authenticator.graph_api_token import get_graph_token


GRAPH_BASE = "https://graph.microsoft.com/v1.0/me"
GRAPH_FILES = "https://graph.microsoft.com/v1.0/me/drive/root/children"

# List OneDrive files
def list_files(token, folder_id=None):
    endpoint = f"{GRAPH_BASE}/me/drive/items/{folder_id}/children" if folder_id else f"{GRAPH_BASE}/me/drive/root/children"
    response = requests.get(endpoint, headers={"Authorization": f"Bearer {token}"})
    return response.json().get("value", [])

# Download file
def download_file(token, file_id, save_path):
    response = requests.get(f"{GRAPH_BASE}/me/drive/items/{file_id}", headers={"Authorization": f"Bearer {token}"})
    download_url = response.json().get("@microsoft.graph.downloadUrl")
    content = requests.get(download_url).content
    with open(save_path, "wb") as f:
        f.write(content)
    print(f"Downloaded: {save_path}")

# Create folder
def create_folder(token, folder_name, parent_id=None):
    endpoint = f"{GRAPH_BASE}/me/drive/items/{parent_id}/children" if parent_id else f"{GRAPH_BASE}/me/drive/root/children"
    response = requests.post(endpoint, 
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        json={"name": folder_name, "folder": {}, "@microsoft.graph.conflictBehavior": "rename"})
    return response.json()

# Upload file
def upload_file(token, local_path, remote_name, parent_id=None):
    endpoint = f"{GRAPH_BASE}/me/drive/items/{parent_id}:/{remote_name}:/content" if parent_id else f"{GRAPH_BASE}/me/drive/root:/{remote_name}:/content"
    with open(local_path, "rb") as f:
        response = requests.put(endpoint, headers={"Authorization": f"Bearer {token}"}, data=f)
    return response.json()

# Move file
def move_file(token, file_id, new_parent_id):
    response = requests.patch(f"{GRAPH_BASE}/me/drive/items/{file_id}",
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        json={"parentReference": {"id": new_parent_id}})
    return response.json()

# Main flow
if __name__ == "__main__":
    token = get_graph_token()
    
    # List files
    files = list_files(token)
    for f in files:
        print(f"{'[Folder]' if 'folder' in f else '[File]'} {f['name']}")
    
    # Download selected files
    download_dir = "./downloads"
    os.makedirs(download_dir, exist_ok=True)
    
    for f in files:
        if "folder" not in f:
            download_file(token, f["id"], os.path.join(download_dir, f["name"]))
    
    # Organize and upload back (example)
    # organized_folder = create_folder(token, "Organized")
    # upload_file(token, "local_file.txt", "uploaded.txt", organized_folder["id"])