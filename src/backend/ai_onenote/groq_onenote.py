import sys
import os
import re
import json
from backend.authenticator.graph_api_token import get_graph_token
from .onenote_handler import (
    get_notebooks, get_sections, get_pages, 
    create_notebook, create_section, create_page,
    search_onenote_pages,
)

def handle_notes(intent, messages, user_input_text=None, client=None):
    print(f"DEBUG: Handler reached! Intent: {intent}", flush=True)
    try:
        token = get_graph_token()
        if not token:
            return "Trouble logging into Microsoft."

        if intent == "list_notebooks":
            notebook_list = get_notebooks(token)
            if not notebook_list:
                return "You don't have any notebooks yet."
            
            context = "Real User Notebooks:\n\n"
            for nb in notebook_list:
                context += f"- {nb['displayName']} (ID: {nb['id']})\n"
            
            system_instruction = (
                "List the notebooks found in a clean, organized way. "
                "Mention that they can ask to see sections inside a specific notebook. "
                "Just use the display names, no IDs"
            )
            
            messages.append({"role": "system", "content": context})
            messages.append({"role": "system", "content": system_instruction})
            return None

        elif intent == "find_note":
            extracted_data = extract_input_data(user_input_text, client, "'topic'")
            query = extracted_data.get('topic')

            if not query or query == "null":
                return "What note are you looking for?"

            search_results = search_onenote_pages(token, query)
            if not search_results:
                return f"I couldn't find any notes matching '{query}'."

            note_context = f"Search Results for '{query}':\n\n"
            for page in search_results:
                title = page.get('title', 'Untitled')
                section = page.get('parentSection', {}).get('displayName', 'Unknown Section')
                link = page.get('links', {}).get('oneNoteWebUrl', {}).get('href', '')
                note_context += f"- {title} (Section: {section})\n  [Open in OneNote]({link})\n\n"

            system_instruction = "Present these search results professionally. Group them by section if possible."
            
            messages.append({"role": "system", "content": note_context})
            messages.append({"role": "system", "content": system_instruction})
            return None

        elif intent == "create_notebook":
            extracted_data = extract_input_data(user_input_text, client, "'name'")
            name = extracted_data.get('name')
            if not name: return "Please provide a name for the new notebook."
            
            create_notebook(token, name)
            return f"I've created a new notebook called '{name}'."

        elif intent == "create_section":
            extracted_data = extract_input_data(user_input_text, client, "'section_name', 'notebook_name'")
            sec_name = extracted_data.get('section_name')
            nb_name = extracted_data.get('notebook_name')

            notebooks = get_notebooks(token)
            target_nb = next((nb for nb in notebooks if nb_name and nb_name.lower() in nb['displayName'].lower()), notebooks[0])
            
            create_section(token, target_nb['id'], sec_name)
            return f"Section '{sec_name}' created inside the '{target_nb['displayName']}' notebook."
        
        elif intent == "list_sections":
            extracted_data = extract_input_data(user_input_text, client, "'notebook_name'")
            nb_name = extracted_data.get('notebook_name')
            
            notebooks = get_notebooks(token)
            target_nb = next((nb for nb in notebooks if nb_name and nb_name.lower() in nb['displayName'].lower()), notebooks[0] if notebooks else None)
            
            if not target_nb: return "I couldn't find any notebooks to look into."

            sections = get_sections(token, target_nb['id'])
            sections_text = f"Sections found in {target_nb['displayName']}:\n"
            for sec in sections:
                name = sec.get('displayName', 'Untitled')
                sections_text += f"- {name}\n"
            
            messages.append({"role": "system", "content": sections_text})
            messages.append({"role": "system", "content": "Tell the user what sections you found and they can ask to see pages within the sections."})
            return None

        elif intent == "list_pages":
            extracted_data = extract_input_data(user_input_text, client, "'section_name'")
            sec_name = extracted_data.get('section_name')

            notebooks = get_notebooks(token)
            all_sections = []
            for nb in notebooks:
                all_sections.extend(get_sections(token, nb['id']))
            
            target_sec = next((s for s in all_sections if sec_name and sec_name.lower() in s['displayName'].lower()), all_sections[0] if all_sections else None)
            
            if not target_sec: return "I couldn't find that section."

            pages = get_pages(token, target_sec['id'])
            context = f"Pages in '{target_sec['displayName']}':\n"
            for p in pages:
                link = p.get('links', {}).get('oneNoteWebUrl', {}).get('href', '')
                context += f"- {p['title']} [View]({link})\n"
            
            messages.append({"role": "system", "content": context})
            messages.append({"role": "system", "content": "List the pages."})
            return None

        elif intent == "create_page":
            extracted_data = extract_input_data(user_input_text, client, "'title', 'content', 'section_name'")
            title = extracted_data.get('title') or "New Note"
            content = extracted_data.get('content')
            sec_name = extracted_data.get('section_name')

            if not content:
                return "I've got the title, but what would you like me to write in the note?"

            notebooks = get_notebooks(token)
            all_sections = []
            for nb in notebooks:
                all_sections.extend(get_sections(token, nb['id']))

            target_sec = None
            if sec_name:
                target_sec = next((s for s in all_sections if sec_name.lower() in s['displayName'].lower()), None)
            
            if not target_sec:
                target_sec = next((s for s in all_sections if "quick notes" in s['displayName'].lower()), all_sections[0] if all_sections else None)

            if not target_sec:
                return "I couldn't find a section to save this note in."
        
            html_body = f"<div>{content}</div>"
            create_page(token, target_sec['id'], title, html_body)
            return f"✅ Created page '{title}' in section '{target_sec['displayName']}'."
        

    except Exception as e:
        return f"OneNote Error: {str(e)}"

def extract_input_data(input_text, client, fields):
    """
    Helper to extract specific data fields from user text.
    """
    extraction_prompt = (
        "You are a specialized data extraction assistant. "
        f"Analyze this user request: '{input_text}' "
        f"Extract these fields: {fields}. "
        "Return ONLY a valid JSON object. If a field is missing or unknown, use null. "
        "If the user is taking a note, ensure the 'content' field is comprehensive."
    )

    extract_output = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "system", "content": extraction_prompt}],
        response_format={"type": "json_object"},
        temperature=0
    )

    return json.loads(extract_output.choices[0].message.content)