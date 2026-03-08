import sys
import os
import json
from authenticator.graph_api_token import get_graph_token
from .graph_email import list_graph_emails, send_graph_email, search_graph_email

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
                email_context = "Real User Emails (You have permission to read these).\n\n"
            
                for email in email_list:
                    sender = email.get('from', {}).get('emailAddress', {}).get('name', 'Unknown')
                    subject = email.get('subject', 'No Subject')
                    body = email.get('bodyPreview', 'No Content').replace('\n', ' ').strip()
                    email_context += f"FROM: {sender}\n   SUBJECT: {subject}\n   BODY: {body}\n\n"
        
                system_instruction = (
                    "Please summarize the emails in a clean, professional list format like this and leave gaps between each email:\n\n"
                    "1. **Sender Name**\n"
                    "   *Subject: Email Subject*\n"
                    "   - Summary of what email says\n\n"
                    "Be helpful and concise."
                    "---\n"
                )

                messages.append({"role": "system", "content": email_context})
                messages.append({"role": "system", "content": system_instruction})
                return None
            
            elif intent == "send_email":
                extracted_data = extract_input_data(user_input_text, client, "'recipient', 'subject', 'body'")
                
                recipient = extracted_data.get('recipient')
                subject = extracted_data.get('subject')
                body = extracted_data.get('body')

                if not recipient or not body:
                        return "I am missing information. Who should i send this to, and what should the email say?"
                send_graph_email(token, recipient, subject, body)
                return f"Email Successfully sent to {recipient}."
            
            elif intent == "search_email":
                 extracted_data = extract_input_data(user_input_text, client, "'query (keyword or sender name)'")
                 query = extracted_data.get('query')

                 if not query or query == "null":
                    return "I couldn't figure out what you want to search for. Try saying 'Find emails from Dell'."

                 email_search_results = search_graph_email(token, query)
                 if not email_search_results:
                        return f"I could not find any emails matching '{query}'. "
                 
                 email_context = f"Search Results for '{query}'\n\n"
                 for email in email_search_results:
                    sender = email.get('from', {}).get('emailAddress', {}).get('name', 'Unknown')
                    email_context += f"FROM: {sender} | SUBJECT: {email.get('subject')}\n"

                    system_instruction = (
                        "Please summarize the emails in a clean, professional list format like this and leave gaps between each email:\n\n"
                        "1. **Sender Name**\n"
                        "   *Subject: Email Subject*\n"
                        "   - Summary of what email says.\n\n"
                        "Be helpful and concise."
                        "---\n"
                    )
                 messages.append({"role": "system", "content": email_context})
                 messages.append({"role": "system", "content": system_instruction})
                 return None
    
        except Exception as e:
            return f"I encountered an error: {str(e)}"

def extract_input_data(input, client, fields):
    
    extraction_prompt = (
         "You are a data extraction assistnat. "
         f"Analyse this request: '{input}' "
         f"Extract these fields: '{fields}' "
         "Return ONLY a JSON object. If field missing, use null. "
         "if task is to send email and no subject provided, create a brief, relevant one to the context. Otherwise ignore this. "
    )

    extract_output = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "system", "content": extraction_prompt}],
        response_format={"type": "json_object"},
        temperature=0
    )

    return json.loads(extract_output.choices[0].message.content)