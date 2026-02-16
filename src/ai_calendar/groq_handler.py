from datetime import timedelta
from dateparser.search import search_dates
from .graph_calendar import get_graph_token, create_event

def create_meeting_from_text(user_input: str):
    """
    decode natural language if contain schedule and meeting then do the following steps
    """
    text = user_input.lower()
    if "meeting" not in text and "schedule" not in text:
        return None

    # extract the time
    results = search_dates(user_input, settings={"PREFER_DATES_FROM": "future"})
    if not results:
        return "I understood you want a meeting, but I couldn't detect the time."

    _, dt = results[0]  # extract the following time
    title = "Meeting"
    start = dt.strftime("%Y-%m-%dT%H:%M:%S")
    end = (dt + timedelta(hours=1)).strftime("%Y-%m-%dT%H:%M:%S")

    try:
        token = get_graph_token()
        create_event(token, title, start, end)
        return f"✅ Meeting created for {dt.strftime('%Y-%m-%d %H:%M')}"
    except Exception as e:
        return f"❌ Error creating meeting: {e}"
