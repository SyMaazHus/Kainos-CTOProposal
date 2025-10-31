### Functional Requirements
*(What the system must do)*

| ID | Requirement | Description |
| :--- | :--- | :--- |
| **FR-1** | **Intelligent Agent** | The system must be a desktop-based application with an embedded intelligent agent. |
| **FR-2** | **Natural Language Interface** | The agent must be able to understand user intent through natural language input. |
| FR-2.1 | Multimodal Input | Users must be able to interact with the agent using text or voice commands. |
| **FR-3** | **Task Automation** | The agent must automate routine tasks. |
| FR-3.1 | File Organisation | The agent shall automate file organisation. |
| FR-3.2 | Meeting Management | The agent shall automatically schedule meetings and provide meeting reminders. |
| FR-3.3 | Note-Taking | The agent shall automate note-taking. |
| **FR-4** | **Productivity Analytics** | The agent must provide personalised productivity insights based on user behaviour. |
| FR-4.1 | Time Tracking | The system shall track time spent on tasks. |
| FR-4.2 | User Feedback | The system shall provide feedback to improve focus. |
| **FR-5** | **Desktop Integration** | The system must integrate with common desktop tools (e.g., calendar, email, file system). |
| **FR-6** | **Context-Aware Suggestions** | The agent must learn from user activity to offer timely recommendations. |
| **FR-7** | **Customisable Workflows** | Users must be able to define rules and triggers for automated actions. |

---

### Non-Functional Requirements
*(How the system should be built or perform)*

| ID | Category | Requirement |
| :--- | :--- | :--- |
| **NFR-1** | **Technology Stack (Frontend)** | The frontend should be built using **Electron.js** or **WPF** (Windows Presentation Foundation). |
| **NNFR-2** | **Technology Stack (Backend)** | The backend should be built using **Node.js** or **Python**. |
| **NFR-3** | **Technology Stack (AI)** | The AI agent should use the **OpenAI API** or **Rasa** for NLP and intent recognition. |
| **NFR-4** | **Technology Stack (Data)** | Data storage should use **SQLite** or **MongoDB**. |
| **NFR-5** | **Technology Stack (Integration)** | Integration for calendar/email access should use the **Microsoft Graph API**. |
| **NFR-6** | **Architecture** | The system must have a modular architecture that allows for future enhancements and integrations. |
| **NFR-7** | **Platform** | The system must be a desktop-based application. |
| **NFR-8** | **Usability** | The application's agent must be responsive. |
| **NG-9** | **Security & Privacy** | The project will use personal data. |