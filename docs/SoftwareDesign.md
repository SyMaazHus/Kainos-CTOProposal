#### 18/02/2026
### ai files first demo flow chart
MSAL login
↓
Get access token
↓
Graph API: list files (OneDrive)
↓
Download files locally
↓
Run your organiser
↓
let user choose whether organise it in local files or Upload back to OneDrive  

### description
This Python program uses MSAL to let a user sign in to their Microsoft account, obtains an access token for Microsoft Graph, lists files from the user’s OneDrive, downloads those files locally, and provides helper functions to create folders, upload files, or move files back in OneDrive. In simple terms, it acts as a bridge between OneDrive and your computer: it authenticates the user, talks to Microsoft Graph to fetch cloud files, saves them locally (where your organizer can run), and optionally uploads or reorganizes them back in OneDrive afterward.

### 23/02/2026
graph_files -> graph api call 
grog_files_handler (current)-> does "chat parsing" without groq, using simple keyword checks etc 

## plan
1.detect keywords 2. detect functions keyword( date, time) 2 groq api
