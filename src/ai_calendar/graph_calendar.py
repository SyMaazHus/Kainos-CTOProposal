import requests

def create_event(token: str, title: str, start: str, end: str, attendees_emails=None):
    """
    Create meeting in personal calendar with optional attendees
    Attendees will automatically get invitation emails
    """
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    payload = {
        "subject": title,
        "start": {"dateTime": start, "timeZone": "UTC"},
        "end": {"dateTime": end, "timeZone": "UTC"},
    }

    if attendees_emails:
        payload["attendees"] = [
            {"emailAddress": {"address": email}, "type": "required"}
            for email in attendees_emails
        ]

    r = requests.post("https://graph.microsoft.com/v1.0/me/events", headers=headers, json=payload)
    r.raise_for_status()
    return r.json()


def delete_event(token: str, event_id: str):
    """
    Delete meeting in personal calendar
    """
    headers = {"Authorization": f"Bearer {token}"}
    url = f"https://graph.microsoft.com/v1.0/me/events/{event_id}"
    r = requests.delete(url, headers=headers)
    r.raise_for_status()
    return True


def get_events(token: str):
    """
    Get all upcoming events
    """
    headers = {"Authorization": f"Bearer {token}"}
    url = "https://graph.microsoft.com/v1.0/me/events?$orderby=start/dateTime&$top=50&$select=id,subject,start,attendees"
    r = requests.get(url, headers=headers)
    r.raise_for_status()
    return r.json().get("value", [])