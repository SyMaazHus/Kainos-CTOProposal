import sys
import os
from authenticator.graph_api_token import get_graph_token
from .graph_email import list_emails

def read_mail(messages: list):

    # if "email" not in text and "inbox" not in text:
    #     return False

    try:
        token = get_graph_token()
        if not token:
            messages.append({"role": "system", "content": "System: Login failed."})
            return False
        
        emails = list_emails(token)

        if not emails:
            messages.append({"role": "system", "content": "System Notification: User's inbox is empty."})
        else:
            email_context = "SYSTEM DATA: Real User Emails (You have permission to read these).\n\n"
            
            for email in emails:
                sender = email.get('from', {}).get('emailAddress', {}).get('name', 'Unknown')
                subject = email.get('subject', 'No Subject')
                body = email.get('bodyPreview', 'No Content').replace('\n', ' ').strip()
                email_context += f"FROM: {sender}\n   SUBJECT: {subject}\n   BODY: {body}\n\n"
        
        system_instruction = (
                "SYSTEM INSTRUCTION: You are an intelligent assistant connected to the user's Outlook. "
                "The data above contains the user's real latest emails. "
                "You have permission to read them. "
                "Please summarize them in a clean, professional list format like this:\n\n"
                "1. **Sender Name**\n"
                "   *Subject: Email Subject*\n"
                "   - A short summary of what the email says.\n\n"
                "Do not mention internal IDs. Be helpful and concise."
            )

        messages.append({"role": "system", "content": email_context})
        messages.append({"role": "system", "content": system_instruction})
        return True

    except Exception as e:
        print(f"Handler Error: {e}")
        messages.append({"role": "system", "content": f"Error: {e}"})
        return False