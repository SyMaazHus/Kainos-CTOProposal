import requests
from datetime import datetime, timedelta, timezone
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


def get_calendar_events(access_token, mode="all"):
    """
    mode:
        "all"
        "next_week"
    """

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Prefer": 'outlook.timezone="Europe/London"'
    }

    if mode == "next_week":
        start = datetime.now(timezone.utc)
        end = start + timedelta(days=7)

        url = "https://graph.microsoft.com/v1.0/me/calendarView"
        params = {
            "startDateTime": start.strftime("%Y-%m-%dT%H:%M:%S"),
            "endDateTime": end.strftime("%Y-%m-%dT%H:%M:%S"),
            "$orderby": "start/dateTime",
            "$select": "subject,start,end,location"
        }

    else: 
        url = "https://graph.microsoft.com/v1.0/me/events"
        params = {
            "$orderby": "start/dateTime",
            "$select": "subject,start,end,location",
            "$top": 50
        }

    response = requests.get(url, headers=headers, params=params)

    if response.status_code != 200:
        raise Exception(f"Graph API error: {response.text}")

    return response.json().get("value", [])
