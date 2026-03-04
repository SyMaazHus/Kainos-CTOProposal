import sys
import os
import json
from authenticator.graph_api_token import get_graph_token
from .graph_email import list_graph_emails, send_graph_email

def handle_email(intent, messages, user_input_text=None, client=None):
        try:
            token = get_graph_token()
            if not token:
                messages.append({"role": "system", "content": "System: Login failed."})
                return "Trouble Logging into Outlook"
    
            if intent == "read_email":
                email_list = list_graph_emails(token)
                if not email_list:
                        return "Inbox Empty"
                email_context = "SYSTEM DATA: Real User Emails (You have permission to read these).\n\n"
            
                for email in email_list:
                    sender = email.get('from', {}).get('emailAddress', {}).get('name', 'Unknown')
                    subject = email.get('subject', 'No Subject')
                    body = email.get('bodyPreview', 'No Content').replace('\n', ' ').strip()
                    email_context += f"FROM: {sender}\n   SUBJECT: {subject}\n   BODY: {body}\n\n"
        
                system_instruction = (
                    "SYSTEM INSTRUCTION: "
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
                return None
            
            elif intent == "send_email":
                extracted_data = extract_input_data(user_input_text, client)
                
                recipient = extracted_data.get('recipient')
                body = extracted_data.get('body')
                subject = extracted_data.get('subject')

                if not recipient or not body:
                        return "I am missing information. Who should i send this to, and what should the email say?"
                send_graph_email(token, recipient, subject, body)
                return f"Email Successfully sent to {recipient}."
    
        except Exception as e:
            print(f"Email Handler Error: {e}")
            return "I encountered an error while accessing your mail."

def extract_input_data(input, client):
    
    extraction_prompt = (
         "You are a data extraction assistnat. "
         f"Analyse this request: '{input}' "
         "Extract the 'recipient' (email address), 'subject' and 'body'. "
         "Return ONLY a JSON object. If field missing, use null. "
         "if no subject provided, create a brief, relevant one to the context. "
    )

    extract_output = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "system", "content": extraction_prompt}],
        response_format={"type": "json_object"},
        temperature=0
    )

    return json.loads(extract_output.choices[0].message.content)

    #     emails = list_emails(token)

    #     if not emails:
    #         messages.append({"role": "system", "content": "System Notification: User's inbox is empty."})
    #     else:
    #         email_context = "SYSTEM DATA: Real User Emails (You have permission to read these).\n\n"
            
    #         for email in emails:
    #             sender = email.get('from', {}).get('emailAddress', {}).get('name', 'Unknown')
    #             subject = email.get('subject', 'No Subject')
    #             body = email.get('bodyPreview', 'No Content').replace('\n', ' ').strip()
    #             email_context += f"FROM: {sender}\n   SUBJECT: {subject}\n   BODY: {body}\n\n"
        
    #     system_instruction = (
    #             "SYSTEM INSTRUCTION: You are an intelligent assistant connected to the user's Outlook. "
    #             "The data above contains the user's real latest emails. "
    #             "You have permission to read them. "
    #             "Please summarize them in a clean, professional list format like this:\n\n"
    #             "1. **Sender Name**\n"
    #             "   *Subject: Email Subject*\n"
    #             "   - A short summary of what the email says.\n\n"
    #             "Do not mention internal IDs. Be helpful and concise."
    #         )

    #     messages.append({"role": "system", "content": email_context})
    #     messages.append({"role": "system", "content": system_instruction})
    #     return True

    # except Exception as e:
    #     print(f"Handler Error: {e}")
    #     messages.append({"role": "system", "content": f"Error: {e}"})
    #     return False