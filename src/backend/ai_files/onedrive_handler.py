import requests
from backend.ai_onenote.onenote_handler import get_token

GRAPH = "https://graph.microsoft.com/v1.0"

# uniform interface for get
def graph_get(url):
    token = get_token()
    res = requests.get(
        url,
        headers={"Authorization": f"Bearer {token}"}
    )
    res.raise_for_status()
    return res

# uniform interface for post
def graph_post(url, payload):
    token = get_token()
    res = requests.post(
        url,
        headers={"Authorization": f"Bearer {token}"},
        json=payload
    )
    res.raise_for_status()
    return res.json()

# uniform interface for patch such as folder
def graph_patch(url, payload):
    token = get_token()
    res = requests.patch(
        url,
        headers={"Authorization": f"Bearer {token}"},
        json=payload
    )
    res.raise_for_status()
    return res.json()

# get the file
def get_root_files():
    url = f"{GRAPH}/me/drive/root/children"
    data = graph_get(url).json()

    files = []

    for item in data.get("value", []):
        if "file" in item:
            files.append({
                "id": item["id"],
                "name": item["name"]
            })

    return files

# get or create folder
def get_or_create_folder(folder_name):
    data = graph_get(f"{GRAPH}/me/drive/root/children").json()

    for item in data.get("value", []):
        if item.get("name") == folder_name and "folder" in item:
            return item

    payload = {
        "name": folder_name,
        "folder": {},
        "@microsoft.graph.conflictBehavior": "rename"
    }

    return graph_post(f"{GRAPH}/me/drive/root/children", payload)

# move a file to folder
def move_file_to_folder(file_id, folder_name):
    folder = get_or_create_folder(folder_name)

    payload = {
        "parentReference": {
            "id": folder["id"]
        }
    }

    return graph_patch(f"{GRAPH}/me/drive/items/{file_id}", payload)