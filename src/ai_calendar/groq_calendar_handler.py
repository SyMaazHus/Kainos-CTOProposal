from datetime import datetime, timedelta
from dateparser.search import search_dates
from authenticator.graph_api_token import get_graph_token
from .graph_calendar import delete_event, create_event, get_events
from .ai_calendar_parser import parse_meeting_with_ai

def create_meeting_from_text(user_input: str):

    try:
        data = parse_meeting_with_ai(user_input)

        title = data.get("title", "Meeting")
        time_text = data.get("time")
        attendees = data.get("attendees", [])

        results = search_dates(time_text, settings={"PREFER_DATES_FROM": "future"})
        if not results:
            return "I understood you want a meeting, but I couldn't detect the time."

        _, dt = results[0]

        start = dt.strftime("%Y-%m-%dT%H:%M:%S")
        end = (dt + timedelta(hours=1)).strftime("%Y-%m-%dT%H:%M:%S")

        token = get_graph_token()

        create_event(token, title, start, end, attendees)

        return f"✅ Meeting '{title}' created for {dt.strftime('%Y-%m-%d %H:%M')}"

    except Exception as e:
        return f"❌ Error creating meeting: {e}"


def delete_meeting_from_text(user_input: str):

    try:
        data = parse_meeting_with_ai(user_input)

        title = data.get("title", "")
        time_text = data.get("time")
        attendees = data.get("attendees", [])

        results = search_dates(time_text, settings={"PREFER_DATES_FROM": "future"})
        if not results:
            return "I understood you want to delete a meeting, but I couldn't detect the time."

        _, target_dt = results[0]

        token = get_graph_token()
        events = get_events(token)

        for event in events:

            start_str = event["start"]["dateTime"][:19]
            start_dt = datetime.fromisoformat(start_str)

            if abs((start_dt - target_dt).total_seconds()) > 300:
                continue

            if title and title.lower() not in event["subject"].lower():
                continue

            if attendees:
                event_attendees = [
                    a["emailAddress"]["address"]
                    for a in event.get("attendees", [])
                ]

                if not all(email in event_attendees for email in attendees):
                    continue

            delete_event(token, event["id"])

            return f"🗑️ Meeting '{event['subject']}' deleted."

        return "No matching meeting found."

    except Exception as e:
        return f"❌ Error deleting meeting: {e}"
