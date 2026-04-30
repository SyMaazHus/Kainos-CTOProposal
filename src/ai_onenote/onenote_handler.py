import os
import requests
import msal
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from datetime import datetime, timezone, timedelta

load_dotenv()

CLIENT_ID = os.getenv("MS_CLIENT_ID")
AUTHORITY = os.getenv("MS_AUTHORITY", "https://login.microsoftonline.com/common")
SCOPES = ["User.Read", "Notes.ReadWrite"]

TOKEN_CACHE_FILE = "ms_token_cache.bin"
GRAPH = "https://graph.microsoft.com/v1.0"


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

    if accounts:
        result = app.acquire_token_silent(SCOPES, account=accounts[0])

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


def graph_get(url):
    token = get_token()
    res = requests.get(
        url,
        headers={"Authorization": f"Bearer {token}"}
    )
    res.raise_for_status()
    return res


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


def get_latest_onenote_page():
    url = f"{GRAPH}/me/onenote/pages?$orderby=lastModifiedDateTime desc&$top=50"
    data = graph_get(url).json()

    pages = data.get("value", [])
    if not pages:
        return None

    target_page = None

    for page in pages:
        title = page.get("title", "").lower().strip()

        if title.startswith("ai summary"):
            continue

        if "summary" in title:
            continue

        if not is_page_stable(page, minutes=5):
            print("Skipping unstable page:", page.get("title"), flush=True)
            continue

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

    return {
        "id": target_page["id"],
        "title": target_page.get("title", "Untitled"),
        "text": text
    }


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

def is_page_stable(page, minutes=5):
    last_modified = page.get("lastModifiedDateTime")
    if not last_modified:
        return False

    last_dt = datetime.fromisoformat(
        last_modified.replace("Z", "+00:00")
    )

    return datetime.now(timezone.utc) - last_dt > timedelta(minutes=minutes)

def is_meeting_title(title):
    title = title.lower()

    keywords = [
        "meeting",
        "meetings",
        "discussion"
    ]

    return any(keyword in title for keyword in keywords)

def get_recent_onenote_pages(limit=20):
    url = f"{GRAPH}/me/onenote/pages?$orderby=lastModifiedDateTime desc&$top={limit}"
    data = graph_get(url).json()

    pages = []

    for page in data.get("value", []):
        title = page.get("title", "").lower().strip()

        if title.startswith("ai summary") or "summary" in title:
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