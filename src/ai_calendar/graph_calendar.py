import requests

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
