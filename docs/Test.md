# Test Report

|Contents|
|--------|
|[Chat page](#chat-page)|
|[Dashboard page](#dashboard-page)|
|[Setting page](#setting-page)|
|[Tutorial page](#tutorial-page)|
|[WorkflowHub page](#workflowhub-page)|


## Chat page

|Test ID|Desciption        |Steps            |Test data  |Expected result|
|-------|------------------|-----------------|-----------|---------------|
|TC1-01 |Verify greeting message  |1.Navigate to chat page|N/A|expect greeting message "Hello. How's your day going?"|
|TC-1-02|Verify submit message(Enter key)|1.Input message<br>2.Enter key press|chatInput: ```Pressing Enter works``` | "Pressing Enter works" is in textblock<br>Input field is reset| 
|TC-1-03|Verify submit message(Send button)|1.Input message<br>2.Sent button press|chatInput: ```Pressing Send works``` | "Pressing Send works" is in textblock<br>Input field is reset| 
|TC1-04 |Rejected empty input      |1.Submit empty text box |chatInput: ``` ``` |chatContainer does not active<br> Message count remain 0 |
|TC1-05 |Verify valid input     |1.Submit empty text box |chatInput: ```Hello``` |"Hello" is in textblock<br>Input field is reset|

## Dashboard page

|Test ID|Desciption        |Steps            |Test data  |Expected result|
|-------|------------------|-----------------|-----------|---------------|
|TC2-01 |Verify page title |1.Navigete to webURL<br>  2.check page title    |N/A   |page title contain "Your Dashboard"|

## Setting page

|Test ID|Desciption        |Steps            |Test data  |Expected result|
|-------|------------------|-----------------|-----------|---------------|
|TC3-01 |Verify page title |1.Navigete to webURL<br>  2.check page title    |N/A   |page title contain "Setting"|
|TC3-02 |Verify name editing|1.fill "new name" into name label |setting-input:```new name```   |setting-input name display "new name"|
|TC3-03 |Verify email editing |1.fill "abc@example.com" into email label |info-input:```abc@example.com```   |info-input name display "abc@example.com"|
|TC3-04 |Toggle notification |1.Locate and click the slider |N/A   |The notification toggle is set be checked state|

## Tutorial page

|Test ID|Desciption        |Steps            |Test data  |Expected result|
|-------|------------------|-----------------|-----------|---------------|
|TC4-01 |Verify next button |1.Verify "tooltip" is visible<br>2.Locate and click next button |N/A   |Tutorial tups still visible and new tip appear|


## WorkflowHub page

|Test ID|Desciption        |Steps            |Test data  |Expected result|
|-------|------------------|-----------------|-----------|---------------|
|TC5-01  |Verify page title |1.Navigete to webURL<br>  2.check page title          |N/A             |page title contain "Workflow Hub"|
|TC5-02  |Add new workflow |1.Click add new workflow<br> 2.Enter task name and description<br> 3.Click submit |Name: task5 <br>Description: new task5 description |Workflow count increase and new task name/description is visible|
|TC5-03|Delete workflow |1.Click delete icon<br> 2.Click confirm |Task 4|Wokrflow count decrease and "Task 4" is remove| 
|TC5-04|Status change when clicked|1.Click status on file organisation <br>2.Click status button on Task 3|file organisation, Task 3|Status class and color is changed to opposite|


## Azure Database Basic Integration

| Test ID | Description | Steps | Test Data | Expected Result |
| :--- | :--- | :--- | :--- | :--- |
| DB1-01 | Verify SQL Connection | 1. Initialize AppDatabase<br>2. Call connect() | N/A | db.pool is defined and connected is true |
| DB1-02 | Fetch Workflow Data | 1. Call getAllWorkflow() | N/A | Returns an array; Data count is logged |
| DB1-03 | Check User Settings | 1. Call getSetting() | N/A | Object returned contains 'email' property |

## Azure Settings Integration

| Test ID | Description | Steps | Test Data | Expected Result |
| :--- | :--- | :--- | :--- | :--- |
| DB2-01 | Update User Name | 1. Get original settings<br>2. Call updateSetting() | Name: `TestUser_[Rand]`<br>Email: `test@kainos.com` | Returns true; DB record matches new name |
| DB2-02 | Update Avatar | 1. Call updateAvatar() | Base64: `data:image/png...` | Returns true; pfp field matches input string |

## Azure Workflow Lifecycle Integration

| Test ID | Description | Steps | Test Data | Expected Result |
| :--- | :--- | :--- | :--- | :--- |
| DB3-01 | Create Task | 1. Call addTask() | Task: `Serial Test [TS]` | Returns valid jobID for subsequent steps |
| DB3-02 | Verify Task Existence | 1. Call getAllWorkflow()<br>2. Find task by ID | tempJobID | Task with tempJobID is found in the list |
| DB3-03 | Switch Status | 1. Call switchStatus() | Status: `0` (Passive) | Returns true; status updated successfully |
| DB3-04 | Delete Task | 1. Call deleteTask() | tempJobID | Returns true; task removed from database |

## Azure Dashboard Data Integration

| Test ID | Description | Steps | Test Data | Expected Result |
| :--- | :--- | :--- | :--- | :--- |
| DB4-01 | Categorize Workflows | 1. Call getActiveWorkflows()<br>2. Call getPassiveWorkflows() | N/A | Returns arrays; active items have status 1 |
| DB4-02 | Format Insights | 1. Call getTimeTable() | N/A | Contains 'Task'/'TimeSpent'; math is valid |
