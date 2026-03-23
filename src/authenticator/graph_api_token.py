import os

from msal import PublicClientApplication
from dotenv import load_dotenv


load_dotenv()

CLIENT_ID = os.getenv("CLIENT_ID")
# Keep updating SCOPE to add the API features
SCOPE = ["Calendars.ReadWrite", 
         "Mail.Read", "Mail.Send",
         "Files.Read","Files.ReadWrite",
         "User.Read"] 

# personal account
app = PublicClientApplication(
    client_id=CLIENT_ID,
    authority="https://login.microsoftonline.com/common"
)

def get_graph_token():
    """
    get token for log in.
    """
    accounts = app.get_accounts()
    if accounts:
        result = app.acquire_token_silent(SCOPE, account=accounts[0])
        if result and "access_token" in result:
            return result["access_token"]

    # open the browser for authentication
    result = app.acquire_token_interactive(scopes=SCOPE)
    if "access_token" in result:
        return result["access_token"]
    else:
        raise ValueError(f"Failed to get token: {result.get('error_description')}")