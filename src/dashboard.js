const Tasks = ["Work on CW1", "Send an email to boss", "Reply to Mark", "Finish invoices", "Look at the feedback"]; // These are examples of tasks decided by the user
const TaskTag = ["CSS","Emails","General","Coding","Backend"]; // These are examples of possible task tags for the "time spent box"
const TaskTime = [0.23,1.5,5.00,0.30,0.23]; // These are examples of times that would have been spent on those tags
const SuggestionExmp = ["Update Language", "Opt in for the analysis AI", "Chat to __ for help"]



function ExampleStartup() {
    const TimeSpentWidget = document.getElementById("TimeSpentBox");
    const WorkflowWidget = document.getElementById("WorkflowBox");
    const BriefWidget = document.getElementById("DailyBriefBox");
    const TaskWidget = document.getElementById("TaskBox");
    const SuggestionArea = document.getElementById("FloatingSpace");

    console.log(TaskWidget,"This is the task widget");

    // If there is nothing there you have to make a empty

    for (var i = 0; i < 5; i++) {

        var taskItem = document.createElement('div');
        taskItem.id = "TaskItem";

        var date = document.createElement('div');
        date.id = "TaskBlockDate";
        date.innerHTML = "The Date";

        var task = document.createElement('div');
        task.id = "TaskBlockText";
        task.innerHTML= (Tasks[i]);

        var check = document.createElement('button');
        check.id="TaskCheckdot";

        taskItem.append(date);
        taskItem.append(task);
        taskItem.append(check);

        TaskWidget.appendChild(taskItem);
    }
    
    addToGeneral2(TaskWidget,"TaskItem","TaskBlockDate","25/12","TaskBlockText","Deliver Presents");

    for (var i =0; i<3; i++){

        addToGeneral1(WorkflowWidget,"WorkflowItem","WorkflowText", "The workflow Item#"+1 );

    }

    for (var i =0; i<5; i++){
        
        addToTimeTask(TimeSpentWidget,TaskTag[i],TaskTime[i]);

    }
    
    for (var i=0; i<3; i++){

        addToBasicSection(SuggestionArea, "SuggestionBubble", SuggestionExmp[i]);
    }

    return 0;
}

function addToGeneral2(ContainerName, WidgetName, DivName, DivContent, DivName2, DivContent2){
    
        var Widget = document.createElement('div');
        Widget.id = WidgetName;

        var item1 = document.createElement('div');
        item1.id = DivName;
        item1.innerHTML = DivContent;

        var item2 = document.createElement('div');
        item2.id = DivName2;
        item2.innerHTML= DivContent2;

        

        Widget.append(item1);
        Widget.append(item2);

        ContainerName.appendChild(Widget);
}


function addToGeneral1(ContainerName,WidgetName,DivName,DivContent){
     var Widget = document.createElement('div');
    Widget.id = WidgetName;

    var item1 = document.createElement('div');
    item1.id = DivName;
    item1.innerHTML = DivContent;

    Widget.append(item1);
    ContainerName.appendChild(Widget);


}


function addToTimeTask(TimeWidget, Tag,Time){
    var timeItem = document.createElement('div');
    timeItem.id = "TimedItem";

    var timedTag = document.createElement('div');
    timedTag.id = "TimedTag";
    timedTag.innerHTML = Tag;

    var timeTime = document.createElement('div');
    timeTime.id = "TimedTime";
    timeTime.innerHTML = Time;

    timeItem.append(timedTag);
    timeItem.append(timeTime);
    TimeWidget.appendChild(timeItem);
}

function addToBasicSection(ContainerName, ItemClass, text){

    var item = document.createElement('div');
    item.id = ItemClass;
    item.className = ItemClass;

    item.innerHTML = text;

    ContainerName.appendChild(item);

}
window.onload = ExampleStartup;
