### Functional Requirements
- What the system must do.

| ID     | Priority | Category                | Requirement                | Description                                                                             |
|:-------|:---------|:------------------------|:---------------------------|:----------------------------------------------------------------------------------------|
| FR-1   | High     | Core Functionality | User needs  | The system must be a desktop-based application|
| FR-1.1 | High     | AI                      | AI Integration|The system must have an embedded intelligent agent|
| FR-2   | High     | AI                      | Natural Language Interface | The agent must be able to understand user intent through natural language input.        |
| FR-2.1 | High     | AI                      | Text Input                 | Users must be able to interact with the agent using text.                               |
| FR-2.2 | Medium   | AI                      | Voice Input                | Users must be able to interact with the agent using voice commands.                     |
| FR-3   | High     | AI & Core Functionality | Task Automation            | The agent must automate routine tasks.                                                  |
| FR-3.1 | High     | AI & Task Automation    | File Organisation          | The agent shall automate file organisation.                                             |
| FR-3.2 | High     | AI &Task Automation     | Meeting Management         | The agent shall automatically schedule meetings and provide meeting reminders.          |
| FR-3.3 | Medium   | AI & Task Automation    | Note-Taking                | The agent shall automate note-taking.                                                   |
| FR-4   | High     | AI & Core Functionality | Productivity Analytics     | The agent must provide personalised productivity insights based on user behaviour.      |
| FR-4.1 | High     | Analytics               | Time Tracking              | The system shall track time spent on tasks.                                             |
| FR-4.2 | High     | AI & Analytics          | User Feedback              | The system shall provide feedback to improve focus.                                     |
| FR-5   | High     | Integration             | Desktop Integration        | The system must integrate with common desktop tools e.g., calendar, email, file system. |
| FR-6   | High     | AI & Core Functionality | Context-Aware Suggestions  | The agent must learn from user activity to offer timely recommendations.                |
| FR-7   | High     | Customisation           | Customisable Workflows     | Users must be able to define rules and triggers for automated actions.                  |
---

### Non-Functional Requirements
- How system should be built

| ID      | Priority | Category                     | Requirement                                                                                       |
|:--------|:---------|:-----------------------------|:--------------------------------------------------------------------------------------------------|
| NFR-1   | High     | Technology Stack Frontend    | The frontend should be built using Electron.js                                                    |
| NFR-2   | High     | Technology Stack Backend     | The backend should be built using Node.js.                                                        |
| NFR-3   | High     | Technology Stack AI          | The AI agent should use the OpenAI API for NLP and intent recognition.                            |
| NFR-4   | High     | Technology Stack Data        | Data storage should use SQLite                                                                    |
| NFR-5   | High     | Technology Stack Integration | Integration for calendar/email access should use the Microsoft Graph API.                         |
| NFR-5.1 | Low      | Technology Stack Integration | Integration for calendar/email access should use the Google API.                                  |
| NFR-6   | Medium   | Architecture                 | The system must have a modular architecture that allows for future enhancements and integrations. |
| NFR-7   | High     | Platform                     | The system must be a desktop-based cross platform application.                                    |
| NFR-8   | High     | Usability                    | The application's agent must be responsive.                                                       |
| NFR-9   | High     | Security & Privacy           | The project will use fake data.                                                                   |