from authenticator.graph_api_token import get_graph_token
from ai_email.graph_email import list_graph_emails
from ai_calendar.graph_calendar import get_calendar_events

def get_feedback(time_table, client):
    try:
        token = get_graph_token()
        
        recent_emails = list_graph_emails(token)
        recent_events = get_calendar_events(token, "next_week")

        history = ""
        if time_table and isinstance(time_table, list):
             for time in time_table:
                  task_name = time.get('Task', 'Unknown Task')
                  duration = time.get('TimeSpent', 0)
                  history += f"- {task_name} ({duration}) minutes"
        else:
            history = "No recent activity recorded in the database."

        if recent_emails:
             email_context = "\n".join([f"- {e['subject']} from {e['from']['emailAddress']['name']}" for e in recent_emails])
        else:
             email_context = "Your inbox is clear! No recent emails."

        if recent_events:
             calendar_context = "\n".join([f"- {c['subject']} at {c['start']['dateTime']}" for c in recent_events])
        else:
             calendar_context = "Your calendar is empty for the next week." 

        prompt = f""" Analyze the user's current situation using their full dashboard data:

                    RECENT DATABASE LOGS (Last 7 Tasks):
                    {history}

                    UPCOMING CALENDAR (Next 7 Events):
                    {calendar_context}

                    LATEST INBOX (Last 5 Emails):
                    {email_context}

                    Task: Provide a "Daily Brief" for the dashboard.
                        - Compare the 7 tasks to the 7 events and 5 emails.
                        - If they are working on something that clashes with a deadline in an email, mention it.
                        - If they have a meeting soon but haven't worked on that topic yet, suggest a switch.
                        - If the calendar and inbox are empty, congratulate them on a clear schedule and comment on their recent tasks.
                        - If they have no tasks or their tasks are empty, encourage them to begin a session.
                        - Keep it to 2-3 short, concise, professional sentences.
                        - Do not use filler words, 
                """

        chat_completion = client.chat.completions.create(
            messages=[{"role": "system", "content": "You are a context-aware productivity assistant."},
                      {"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            temperature=0.7
        )
        
        return chat_completion.choices[0].message.content
        

    except Exception as e:
            return f"I encountered an error: {str(e)}"
