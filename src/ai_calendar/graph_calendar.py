import os
import requests
from msal import PublicClientApplication
from dotenv import load_dotenv

load_dotenv()

CLIENT_ID = os.getenv("CLIENT_ID")
SCOPE = ["Calendars.ReadWrite"]

# personal account
app = PublicClientApplication(
    client_id=CLIENT_ID,
    authority="https://login.microsoftonline.com/common"
)

def get_graph_token():
    """
    get token for log in.
    """
    accounts = app.get_accounts()
    if accounts:
        result = app.acquire_token_silent(SCOPE, account=accounts[0])
        if result and "access_token" in result:
            return result["access_token"]

    # open the browser for authentication
    result = app.acquire_token_interactive(scopes=SCOPE)
    if "access_token" in result:
        return result["access_token"]
    else:
        raise ValueError(f"Failed to get token: {result.get('error_description')}")

def create_event(token: str, title: str, start: str, end: str):
    """
    create meeting in personal calendar
    """
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    payload = {
        "subject": title,
        "start": {"dateTime": start, "timeZone": "UTC"},
        "end": {"dateTime": end, "timeZone": "UTC"}
    }

    r = requests.post("https://graph.microsoft.com/v1.0/me/events", headers=headers, json=payload)
    r.raise_for_status()
    return r.json()
