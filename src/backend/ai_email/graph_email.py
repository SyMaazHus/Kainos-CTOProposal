import requests

# this functions aims to list top 5 emails in the email box through Azure
def list_graph_emails(token: str):

    # Prepare HTTP headers with authentication token
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    url = "https://graph.microsoft.com/v1.0/me/mailFolders/inbox/messages?$top=5&$select=from,subject,bodyPreview&$orderby=receivedDateTime desc"

    r = requests.get(url, headers=headers)
    r.raise_for_status() 
    return r.json().get('value', [])

# this functions aims to send email using the parsed input
def send_graph_email(token: str, recipient: str, subject: str, body: str):

    # Prepare HTTP headers with authentication token
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    url = "https://graph.microsoft.com/v1.0/me/sendMail"

    # Prepare the email information used to send an email through API
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

# this functions aims to search the email
def search_graph_email(token: str, query: str):

    # Prepare HTTP headers with authentication token
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    url = f"https://graph.microsoft.com/v1.0/me/messages?$search=\"{query}\"&$top=5"
    
    r = requests.get(url, headers=headers)
    r.raise_for_status()
    return r.json().get('value', [])
