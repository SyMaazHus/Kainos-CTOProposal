import os
import requests
import msal
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from datetime import datetime, timezone, timedelta

# the basic configuration need to be loaded before call the AI and Azure
load_dotenv()

CLIENT_ID = os.getenv("MS_CLIENT_ID")
AUTHORITY = os.getenv("MS_AUTHORITY", "https://login.microsoftonline.com/common")
SCOPES = ["User.Read", "Notes.ReadWrite"]

TOKEN_CACHE_FILE = "ms_token_cache.bin"
GRAPH = "https://graph.microsoft.com/v1.0"
GRAPH_BASE = "https://graph.microsoft.com/v1.0/me/onenote"

# get the token for the whole application need to call Azure
def get_token():
    cache = msal.SerializableTokenCache()

    if os.path.exists(TOKEN_CACHE_FILE):
        with open(TOKEN_CACHE_FILE, "r") as f:
            cache.deserialize(f.read())

    app = msal.PublicClientApplication(
        CLIENT_ID,
        authority=AUTHORITY,
        token_cache=cache
    )

    accounts = app.get_accounts()
    result = None

    # the account to access the Azure
    if accounts:
        result = app.acquire_token_silent(SCOPES, account=accounts[0])

    # get the error message
    if not result:
        flow = app.initiate_device_flow(scopes=SCOPES)

        if "user_code" not in flow:
            print("Device flow failed:", flow, flush=True)
            raise Exception(f"Device flow failed: {flow}")

        print(flow["message"], flush=True)
        result = app.acquire_token_by_device_flow(flow)

    if cache.has_state_changed:
        with open(TOKEN_CACHE_FILE, "w") as f:
            f.write(cache.serialize())

    if "access_token" not in result:
        raise Exception(result)

    return result["access_token"]

# uniform interface for get
def graph_get(url):
    token = get_token()
    res = requests.get(
        url,
        headers={"Authorization": f"Bearer {token}"}
    )
    res.raise_for_status()
    return res

# uniform interface for post
def graph_post_html(url, html):
    token = get_token()
    res = requests.post(
        url,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "text/html"
        },
        data=html.encode("utf-8")
    )
    res.raise_for_status()
    return res.json()

# get the latest onenote page
def get_latest_onenote_page():
    url = f"{GRAPH}/me/onenote/pages?$orderby=lastModifiedDateTime desc&$top=50"
    data = graph_get(url).json()

    # record all the pages
    pages = data.get("value", [])
    if not pages:
        return None

    target_page = None

    # extract each page
    for page in pages:
        title = page.get("title", "").lower().strip()

        # skip summarised note 
        if title.startswith("ai summary"):
            continue

        if "summary" in title:
            continue

        # skip if the note has not finished yet
        if not is_page_stable(page, minutes=5):
            print("Skipping unstable page:", page.get("title"), flush=True)
            continue

        # skip that is not meeting page
        if not is_meeting_title(title):
            print("Skipping non-meeting page:", page.get("title"), flush=True)
            continue

        target_page = page
        break

    if not target_page:
        return None

    content_url = f"{GRAPH}/me/onenote/pages/{target_page['id']}/content"
    html = graph_get(content_url).text

    soup = BeautifulSoup(html, "html.parser")
    text = soup.get_text("\n", strip=True)

    # return the page
    return {
        "id": target_page["id"],
        "title": target_page.get("title", "Untitled"),
        "text": text
    }

# create another summary page
def create_summary_page(source_title, summary):
    html = f"""
    <html>
      <head>
        <title>AI Summary - {source_title}</title>
      </head>
      <body>
        <h1>AI Summary - {source_title}</h1>
        <p>{summary}</p>
      </body>
    </html>
    """

    url = f"{GRAPH}/me/onenote/pages"
    return graph_post_html(url, html)

# check whether the note is finished throw renew in time
def is_page_stable(page, minutes=5):
    last_modified = page.get("lastModifiedDateTime")
    if not last_modified:
        return False

    last_dt = datetime.fromisoformat(
        last_modified.replace("Z", "+00:00")
    )

    return datetime.now(timezone.utc) - last_dt > timedelta(minutes=minutes)

# check the title of meeting 
def is_meeting_title(title):
    title = title.lower()

    keywords = [
        "meeting",
        "meetings",
        "discussion"
    ]

    return any(keyword in title for keyword in keywords)

# get recent pages
def get_recent_onenote_pages(limit=20):
    url = f"{GRAPH}/me/onenote/pages?$orderby=lastModifiedDateTime desc&$top={limit}"
    data = graph_get(url).json()

    pages = []

    for page in data.get("value", []):
        title = page.get("title", "").lower().strip()

        # skip AI summarisedn notes
        if title.startswith("ai summary") or "summary" in title:
            continue

        # skip not finished note
        if not is_page_stable(page, minutes=5):
            print("Skipping unstable page:", page.get("title"), flush=True)
            continue

        content_url = f"{GRAPH}/me/onenote/pages/{page['id']}/content"
        html = graph_get(content_url).text

        soup = BeautifulSoup(html, "html.parser")
        text = soup.get_text("\n", strip=True)

        pages.append({
            "id": page["id"],
            "title": page.get("title", "Untitled"),
            "text": text
        })

    return pages

# get notebook
def get_notebooks(token):
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    r = requests.get(f"{GRAPH_BASE}/notebooks", headers=headers)
    return r.json().get('value', [])

# get the section in onenote
def get_sections(token, notebook_id=None):
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    # a filter to select the target notebook
    if notebook_id:
        url = f"{GRAPH_BASE}/sections?$filter=parentNotebook/id eq '{notebook_id}'"
    else:
        url = f"{GRAPH_BASE}/sections"
    response = requests.get(url, headers=headers)
    return response.json().get('value', [])

# get the pages
def get_pages(token, section_id=None):
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    endpoint = f"{GRAPH_BASE}/sections/{section_id}/pages" if section_id else f"{GRAPH_BASE}/pages"
    response = requests.get(endpoint, headers=headers)
    return response.json().get('value', [])

# search for onenote pages
def search_onenote_pages(token, query):
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Prefer": 'outlook.body-content-type="text"'
    }
    url = f"{GRAPH_BASE}/pages?$orderby=lastModifiedDateTime desc&$top=50&$select=title,id,links,parentSection"

    # try to find matched pages among all pages
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        data = response.json()
        pages = data.get("value", [])

        query = query.lower()
        matches = []
        
        for p in pages:
            title = p.get("title", "").lower()
            if query in title:
                matches.append(p)
        
        return matches

    except Exception as e:
        print(f"DEBUG: OneNote Search Error: {e}", flush=True)
        return []

# create a new notebook
def create_notebook(token, display_name):
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    payload = {"displayName": display_name}
    response = requests.post(f"{GRAPH_BASE}/notebooks", headers=headers, json=payload)
    return response.json()

# create a new section
def create_section(token, notebook_id, display_name):
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    payload = {"displayName": display_name}
    response = requests.post(f"{GRAPH_BASE}/notebooks/{notebook_id}/sections", headers=headers, json=payload)
    return response.json()

# create a new page
def create_page(token, section_id, title, html_content):
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/xhtml+xml"}
    full_html = f"""
    <!DOCTYPE html>
    <html>
      <head><title>{title}</title></head>
      <body>
        {html_content}
      </body>
    </html>
    """
    response = requests.post(f"{GRAPH_BASE}/sections/{section_id}/pages", headers=headers, data=full_html.encode('utf-8'))
    return response.json()