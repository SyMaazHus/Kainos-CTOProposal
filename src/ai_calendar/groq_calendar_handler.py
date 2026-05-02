from datetime import datetime, timedelta, timezone
import pytz
from authenticator.graph_api_token import get_graph_token
from .graph_calendar import delete_event, create_event, get_events
from .ai_calendar_parser import parse_meeting_with_ai

LONDON_TZ = pytz.timezone('Europe/London')

def create_meeting_from_text(user_input: str):

    try:
        data = parse_meeting_with_ai(user_input)

        title = data.get("title", "Meeting")
        attendees = data.get("attendees", [])
        start_datetime = data.get("start_datetime")
        end_datetime = data.get("end_datetime")

        if not start_datetime:
            return "I understood you want a meeting, but I couldn't detect the time."

        print(f"[DEBUG] AI returned start_datetime: {start_datetime}")
        print(f"[DEBUG] AI returned end_datetime: {end_datetime}")

        start_local = datetime.fromisoformat(start_datetime)
        if end_datetime:
            end_local = datetime.fromisoformat(end_datetime)
        else:
            end_local = start_local + timedelta(hours=1)

        print(f"[DEBUG] Parsed start_local: {start_local}, type: {type(start_local)}")
        print(f"[DEBUG] Parsed end_local: {end_local}, type: {type(end_local)}")

        token = get_graph_token()

        start_str = start_local.strftime("%Y-%m-%dT%H:%M:%S")
        end_str = end_local.strftime("%Y-%m-%dT%H:%M:%S")

        print(f"[DEBUG] Formatted start_str: {start_str}")
        print(f"[DEBUG] Formatted end_str: {end_str}")
        print(f"[DEBUG] Calling create_event with tz=Europe/London")

        result = create_event(token, title, start_str, end_str, attendees, timezone_str="Europe/London")

        print(f"[DEBUG] API response start: {result.get('start', {})}")
        print(f"[DEBUG] API response end: {result.get('end', {})}")
        print(f"[DEBUG] API response subject: {result.get('subject', {})}")

        return f"✅ Meeting '{title}' created for {start_datetime} (Europe/London)"

    except Exception as e:
        return f"❌ Error creating meeting: {e}"


def delete_meeting_from_text(user_input: str):

    try:
        data = parse_meeting_with_ai(user_input)

        title = data.get("title", "")
        attendees = data.get("attendees", [])
        start_datetime = data.get("start_datetime")

        # use AI returned start_datetime（Local time）
        target_dt_utc = None
        if start_datetime:
            try:
                target_dt_local = datetime.fromisoformat(start_datetime)
                target_dt_utc = LONDON_TZ.localize(target_dt_local).astimezone(pytz.UTC)
                print(f"[DEBUG] target_dt (local): {start_datetime}, target_dt_utc: {target_dt_utc}")
            except ValueError as e:
                return f"I understood you want to delete a meeting, but I couldn't parse the time: '{start_datetime}' - Error: {e}"

        token = get_graph_token()
        events = get_events(token)

        matching_events = []

        for event in events:
            if target_dt_utc is not None:
                start_str = event["start"]["dateTime"]
                print(f"[DEBUG] API returned start: {start_str}")
                
                # Handle different time formats from API
                # Format 1: "2026-05-03T01:00:00.0000000" (naive)
                # Format 2: "2026-05-03T01:00:00+00:00" (aware)
                # Format 3: "2026-05-03T01:00:00Z" (aware)
                
                # Truncate microseconds to make parsing more reliable
                if '.' in start_str:
                    start_str = start_str[:19]
                
                # Parse the datetime
                try:
                    start_dt = datetime.fromisoformat(start_str)
                except ValueError:
                    # Try with timezone replacement if Z is present
                    if 'Z' in start_str:
                        start_str = start_str.replace('Z', '+00:00')
                        start_dt = datetime.fromisoformat(start_str)
                    else:
                        continue
                
                # Ensure start_dt is offset-aware (as UTC)
                if start_dt.tzinfo is None:
                    start_dt = start_dt.replace(tzinfo=timezone.utc)
                
                print(f"[DEBUG] Parsed start_dt: {start_dt}, tzinfo: {start_dt.tzinfo}")

                if abs((start_dt - target_dt_utc).total_seconds()) > 300:
                    continue

            event_subject = event.get("subject") or ""
            if title and title.lower() not in event_subject.lower():
                continue

            if attendees:
                event_attendees = [
                    a["emailAddress"]["address"]
                    for a in event.get("attendees", [])
                ]
                if not all(email in event_attendees for email in attendees):
                    continue

            matching_events.append(event)

        if len(matching_events) == 0:
            if target_dt_utc is None:
                return f"No meeting found with title containing '{title}'."
            else:
                return f"No meeting found at that time with title containing '{title}'."
        elif len(matching_events) == 1:
            event = matching_events[0]
            delete_event(token, event["id"])
            return f"🗑️ Meeting '{event.get('subject', 'Untitled')}' deleted."
        else:
            # find several match, user can choose
            event_list = "\n".join([
                f"  • '{e.get('subject', 'Untitled')}' at {e['start']['dateTime'][:16]}"
                for e in matching_events[:5]
            ])
            return f"Found {len(matching_events)} matching meetings:\n{event_list}\n\nPlease be more specific (add time or more specific title)."

    except Exception as e:
        return f"❌ Error deleting meeting: {e}"
