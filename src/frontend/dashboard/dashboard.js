const Tasks = ["Work on CW1", "Send an email to boss", "Reply to Mark", "Finish invoices", "Look at the feedback"]; // These are examples of tasks decided by the user
const TaskTag = ["CSS","Emails","General","Coding","Backend"]; // These are examples of possible task tags for the "time spent box"
const TaskTime = [0.23,1.5,5.00,0.30,0.23]; // These are examples of times that would have been spent on those tags
const SuggestionExmp = ["Update Language", "Opt in for the analysis AI", "Chat to __ for help"]

// These are the document constants
const ColourCollections = ["#366184","#658b91","#86ab93"]
const TimeSpentWidget = document.querySelector(".TimeSpentBox");
const WorkflowWidget = document.querySelector(".WorkflowBox");
const BriefWidget = document.querySelector(".DailyBriefBox");
const TaskWidget = document.querySelector(".TaskBox");
const SuggestionArea = document.querySelector(".FloatingSpace");

// Initial loader and startup function that accesses the azure database
const renderWork = async () => {
    const WorkflowWidget = document.getElementById("WorkflowBox");

    const tasks = await window.apiDB.getActiveWorkflows();
    tasks.forEach(task =>{
        addToWorkflow(WorkflowWidget,task.title );

    });


    // Connect to server.py back-end through get calendar events
    try {
        const calResponse = await fetch('http://127.0.0.1:5000/get_calendar_events?mode=next_week');
        const calData = await calResponse.json();

        // If data has been fetched successfully
        if (calData.status === "success") {
            // if there is no meetings / events
            if (calData.events.length === 0) {
                addToTodo(TaskWidget, "No Upcoming Meetings/Tasks this week!") // Tell UI
            } else {
                // for each event, get the date and time
                calData.events.forEach(event =>{
                    let eventDate = new Date(event.start);
                    let timeString = eventDate.toLocaleDateString([], { hour: '2-digit', minute: '2-digit' });  
                    
                    // Add event title, data and time to Widget
                    addToTodo(TaskWidget, `${event.title} (${timeString})`);
                })
            }
        } else {
            console.error("Calendar fetch returned an error:", calendarData.message);
            addToTodo(TaskWidget, "Failed to load calendar.");
        }
    } catch (err) {
        console.error("Failed to connect to Calendar Endpoint:", err);
        addToTodo(TaskWidget, "Calendar connection failed.");
    }

    const times = await window.apiDB.getTimeTable();
    times.forEach(item =>{
        let timeHourValue = item.TimeSpent /60;
        let timeToPrint = ""+timeHourValue.toFixed(2);

        addToTimeTask(TimeSpentWidget, item.Task, timeToPrint);

    });
    
    // Clear to avoid any overlap
    BriefWidget.innerHTML = "";
    addToBrief(BriefWidget,"Getting Your Personalised Feedback...");

    // Connect to server.py backend, AI Brief function
    try {
        const response = await fetch('http://127.0.0.1:5000/get_ai_brief', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                time_table: times // Passing the Insights DB to server
            })
        });

        const data = await response.json();
        
        // Update the UI
        BriefWidget.innerHTML = "";
        addToBrief(BriefWidget, data.brief);
        

    } catch (err) {
        console.error("AI Feedback Connection Failed:", err);
        BriefWidget.innerHTML = "";
        addToBrief(BriefWidget, "AI Feedback Connection Failed.");
    }


}

renderWork();


function addToTodo(ContainerName, Content){
    
        var Widget = document.createElement('div');
        Widget.id = "TwoInfoItem";

        var item1 = document.createElement('div');
        item1.id = "ContentText";
        item1.innerHTML = "To Do:";

        var item2 = document.createElement('div');
        item2.id = "ContentText";
        item2.innerHTML= Content;

        Widget.append(item1);
        Widget.append(item2);

        Widget.style.backgroundColor = ColourCollections[Math.floor(Math.random() * 3)];


        ContainerName.appendChild(Widget);
}


function addToWorkflow(ContainerName,Content){
    var Widget = document.createElement('div');
    Widget.id = "OneInfoItem";

    var item1 = document.createElement('div');
    item1.id = "ContentText";
    item1.innerHTML = Content;

    Widget.append(item1);

    Widget.style.backgroundColor = ColourCollections[Math.floor(Math.random() * 3)];

    ContainerName.appendChild(Widget);


}


function addToTimeTask(TimeWidget, Tag,Time){
    var timeItem = document.createElement('div');
    timeItem.id = "TwoInfoItem";

    var timedTag = document.createElement('div');
    timedTag.id = "ContentText";
    timedTag.innerHTML = Tag;

    var timeTime = document.createElement('div');
    timeTime.id = "ContentText";
    timeTime.innerHTML = Time;

    timeItem.append(timedTag);
    timeItem.append(timeTime);

    timeItem.style.backgroundColor = ColourCollections[Math.floor(Math.random() * 3)];

    TimeWidget.appendChild(timeItem);
}

function addToBrief(BriefBox, information){

    var item = document.createElement('div');
    item.id = "OneInfoItem";
    item.className = "OneInfoItem";

    var text = document.createElement('div');
    text.id = "ContentText";
    text.className = "ContentText";

    text.innerHTML = information;

    item.appendChild(text);
    BriefBox.appendChild(item);

}

