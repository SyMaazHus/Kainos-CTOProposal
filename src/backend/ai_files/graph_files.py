
import requests


GRAPH_BASE = "https://graph.microsoft.com/v1.0"
GRAPH_FILES = "https://graph.microsoft.com/v1.0/me/drive/root/children"

# List OneDrive files
def list_files(token, folder_id=None, recursive=False):
    if recursive:
        endpoint = f"{GRAPH_BASE}/me/drive/root/search(q='*')"
    else:
        if folder_id:
            endpoint = f"{GRAPH_BASE}/me/drive/items/{folder_id}/children"
        else:
            endpoint = f"{GRAPH_BASE}/me/drive/root/children"
    response = requests.get(endpoint, headers={"Authorization": f"Bearer {token}"})
    response.raise_for_status()
    return response.json().get("value", [])

# Create folder
def create_folder(token, folder_name, parent_id=None):
    endpoint = f"{GRAPH_BASE}/me/drive/items/{parent_id}/children" if parent_id else f"{GRAPH_BASE}/me/drive/root/children"
    response = requests.post(endpoint, 
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        json={"name": folder_name, "folder": {}, "@microsoft.graph.conflictBehavior": "rename"})
    return response.json()


# Move file
def move_file(token, file_id, new_parent_id):
    response = requests.patch(f"{GRAPH_BASE}/me/drive/items/{file_id}",
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        json={"parentReference": {"id": new_parent_id}})
    return response.json()