import requests

def list_graph_emails(token: str):
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    r = requests.get("https://graph.microsoft.com/v1.0/me/messages?$top=5&$select=from,subject,bodyPreview", headers=headers)
    r.raise_for_status() 
    return r.json().get('value', [])

def send_graph_email(token: str, recipient: str, subject: str, body: str):
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    url = "https://graph.microsoft.com/v1.0/me/sendMail"

    email_payload = {
        "message": {
            "subject": subject,
            "body": {
                "contentType": "Text", 
                "content": body
            },
            "toRecipients": [
                {
                    "emailAddress": {
                        "address": recipient
                    }
                }
            ]
        },
        "saveToSentItems": "true"
    }

    r = requests.post(url, headers=headers, json=email_payload)
    r.raise_for_status()
    return True
