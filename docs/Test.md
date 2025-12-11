# Test Report

|Contents|
|--------|
|[Chat page](#chat-page)|
|[Dashboard page](#dashboard-page)|
|[Setting page](#setting-page)|
|[Tutorial page](#tutorial-page)|
|[WorkflowHub page](#workflowhub-page)|




## WorkflowHub page

|Test ID|Desciption        |Steps            |Test data  |Expected result|
|-------|------------------|-----------------|----------|--------------|
|TC-01  |Verify page title |1.navigete to webURL<br>  2.check page title          |N/A             |page title contain "Workflow Hub"|
|TC-02  |Add new workflow |1.Click add new workflow<br> 2.Enter task name and description<br> 3.Click submit |Name: task5 <br>Description: new task5 description |Workflow count increase and new task name/description is visible|
|TC-03|Delete workflow |1.Click delete icon<br> 2.Click confirm |Task 4|Wokrflow count decrease and "Task 4" is remove| 
|TC-04|Status change<br> file organisation: Active<br> Task 3: Inactive|1.Click status icon|file organisation, Task 3|Status class and color is changed to opposite|
