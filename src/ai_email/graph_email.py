import requests

def list_emails(token: str):
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    r = requests.get("https://graph.microsoft.com/v1.0/me/messages?$top=5&$select=from,subject,bodyPreview", headers=headers)
    r.raise_for_status() 
    return r.json().get('value', [])