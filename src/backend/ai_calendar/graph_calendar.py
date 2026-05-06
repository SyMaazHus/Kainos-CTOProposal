import requests
from datetime import datetime, timedelta, timezone

# this functions aims to create a meeting in the Microsoft calendar
def create_event(token: str, title: str, start: str, end: str, attendees_emails=None, timezone_str="Europe/London"):
    """
    Create meeting in personal calendar with optional attendees
    Attendees will automatically get invitation emails
    """
    # Prepare HTTP headers with authentication token
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    # Construct request payload for event creation
    payload = {
        "subject": title,
        "start": {"dateTime": start, "timeZone": timezone_str},
        "end": {"dateTime": end, "timeZone": timezone_str},
    }

    print(f"[DEBUG graph_calendar] Payload: {payload}")

    # Add attendees if provided
    if attendees_emails:
        payload["attendees"] = [
            {"emailAddress": {"address": email}, "type": "required"}
            for email in attendees_emails
        ]

    # Send POST request to Microsoft Graph API to create event
    r = requests.post("https://graph.microsoft.com/v1.0/me/events", headers=headers, json=payload)

    # Raise exception if request failed
    r.raise_for_status()
    return r.json()

# this function aims to help delete an existing event in the Microsoft calendar
def delete_event(token: str, event_id: str):
    """
    Delete meeting in personal calendar
    """
    headers = {"Authorization": f"Bearer {token}"}
    url = f"https://graph.microsoft.com/v1.0/me/events/{event_id}"
    r = requests.delete(url, headers=headers)
    r.raise_for_status()
    return True

# this function aims to get the top 50 events near in the calendar 
def get_events(token: str):
    """
    Get all upcoming events
    """
    headers = {"Authorization": f"Bearer {token}"}
    url = "https://graph.microsoft.com/v1.0/me/events?$orderby=start/dateTime&$top=50&$select=id,subject,start,attendees"
    r = requests.get(url, headers=headers)
    r.raise_for_status()
    return r.json().get("value", [])


# this function aims to get the event for all or for next weeek 
def get_calendar_events(access_token, mode="all"):
    # two mode that user could choose
    """
    mode:
        "all"
        "next_week"
    """

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Prefer": 'outlook.timezone="Europe/London"'
    }

    # next week mode only get next week events
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

    # get all the upcoming events in the calendar
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
