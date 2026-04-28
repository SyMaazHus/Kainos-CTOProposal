
// This takes note of the time when the session started
let startTime = null;
let timerInterval = null;

const taskInput = document.getElementById("taskInput");
const startBtn = document.getElementById("startBtn");
const finishBtn = document.getElementById("finishBtn");
const activeSession = document.getElementById("activeSession");
const activeTask = document.getElementById("activeTask");
const TotalFocus = document.getElementById("totalFocus");
const timerDisplay = document.getElementById("timer");
const AverageSession = document.getElementById("averageSession");
const SessionCount = document.getElementById("sessionCount");
const BestDat = document.getElementById("bestDay");

function formatTime(seconds) {
  const hrs = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  return `${hrs}:${mins}:${secs}`;
}

function startTimer() {
  timerInterval = setInterval(() => {
    // Calculates elapsed time in seconds
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    // Updates the timer display
    timerDisplay.textContent = formatTime(elapsed);
  }, 1000);
}

function formatDateDB(today){
  // Extract day, month, and year
  let day = today.getDate();
  let month = today.getMonth() + 1;
  let year = today.getFullYear();

  // Add leading zero to day and month if needed
  day = day < 10 ? '0' + day : day;
  month = month < 10 ? '0' + month : month;

  // Format the date as dd/mm/yyyy
  const formattedDate = Number(`${day}${month}${year}`);
  return formattedDate;
}

function formatTimeDB(today){
  // Extracting hours and minutes
  let hour = today.getHours();
  let minute = today.getMinutes();

  // Add leading zero to hour and minute if needed
  hour = hour < 10 ? '0' + hour : hour;
  hour = hour = 0 ? '00' + hour: hour;
  minute = minute < 10 ? '0' + minute : minute;

  const formattedTime = Number(`${hour}${minute}`);
  return formattedTime;
}

window.addEventListener("DOMContentLoaded", () => {
  // Starts the session button
  startBtn.addEventListener("click", () => {
    if (!taskInput.value.trim()) return;
  // Records the current time
    startTime = Date.now();
    localStorage.setItem("activeTask", taskInput.value);
    localStorage.setItem("startTime", startTime);

    activeTask.textContent = taskInput.value;
    activeSession.style.display = "block";
    // show finish button
    startBtn.style.display = "none";
    finishBtn.style.display = "inline-block";
    taskInput.disabled = true;
   // Begins the timer updates
    startTimer();
  });

  finishBtn.onclick = async function() {
    // Here is the timer being saved to the database
    await window.apiIS.addTimeActivity(Math.floor((Date.now() - startTime) / 60000),localStorage.getItem("activeTask"),formatDateDB(new Date()),formatTimeDB(new Date()));

    clearInterval(timerInterval);
    localStorage.removeItem("activeTask");
    localStorage.removeItem("startTime");

    taskInput.value = "";
    taskInput.disabled = false;
    activeSession.style.display = "none";
    startBtn.style.display = "inline-block";
    finishBtn.style.display = "none";
    timerDisplay.textContent = "00:00:00";
  };

  // Restores the session if app reloads
  const savedTask = localStorage.getItem("activeTask");
  const savedStart = localStorage.getItem("startTime");

  if (savedTask && savedStart) {
    startTime = Number(savedStart);
    
    // Restores the task input
    taskInput.value = savedTask;
    taskInput.disabled = true;

    activeTask.textContent = savedTask;
    activeSession.style.display = "block";
    startBtn.style.display = "none";
    finishBtn.style.display = "inline-block";
   
    // Restarts the timer
    startTimer();
  }
});

const focusChart = document.getElementById("focusChart");
const productivityChart = document.getElementById("productivityChart");

getTotalTimeSpentOnDay = async function(weekDay){

  const today = new Date();


  // Add 7 days to that difference to jump back to the PREVIOUS week
  let daysToSubtract = (today.getDay() - weekDay) + 7;

  const lastWeek = new Date();
  lastWeek.setDate(today.getDate() - daysToSubtract);


  const dateSearch = formatDateDB(lastWeek);

  let totalTime = 0;
  const arrayOfTimesSpent = await window.apiIS.getTimeSpentFromDate(dateSearch);
  arrayOfTimesSpent.forEach(time =>{
      totalTime = totalTime + time.TimeSpent;
  });
  return totalTime;
}

getTotalTimeSpentToday = async function(){
  const today = new Date();

  const dateSearch = formatDateDB(today);
  let totalTime = 0;
  const arrayOfTimesSpent = await window.apiIS.getTimeSpentFromDate(dateSearch);
  arrayOfTimesSpent.forEach(time =>{
      totalTime = totalTime + time.TimeSpent;
  });

  const returnVal = ""+totalTime+" minutes";
  return returnVal;

}

getTotalSessionsToday = async function(){
  const today = new Date();
  const dateSearch = formatDateDB(today);
  let totalSessions = 0;
  const arrayOfTimesSpent = await window.apiIS.getTimeSpentFromDate(dateSearch);
  arrayOfTimesSpent.forEach(time =>{
      totalSessions += 1;
  });

  const returnVal = totalSessions;
  return returnVal;
}

getAverageSessionTimeToday = async function(){
  const today = new Date();

  const dateSearch = formatDateDB(today);
  let totalTime = 0;
  const arrayOfTimesSpent = await window.apiIS.getTimeSpentFromDate(dateSearch);
  arrayOfTimesSpent.forEach(time =>{
      totalTime = totalTime + time.TimeSpent;
  });

  const returnVal = (totalTime / await getTotalSessionsToday())+" minutes";
  return returnVal;

}

getTotalTimeSpentOnWeek = async function(weekAgo){

  const today = new Date();

  let totalTime = 0;

  const daysToWeek = today.getDay() + (weekAgo*7);

  for(let weekday=0; weekday<7; weekday++){
  // Add 7 days to that difference to jump back to the PREVIOUS week

  const lastWeek = new Date();
  lastWeek.setDate(today.getDate() - daysToWeek + weekday);


  const dateSearch = formatDateDB(lastWeek);

  const arrayOfTimesSpent = await window.apiIS.getTimeSpentFromDate(dateSearch);
  arrayOfTimesSpent.forEach(time =>{
      totalTime = totalTime + time.TimeSpent;
  });
  }
  return totalTime;
}

const renderWork = async () => {
    const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    const dayIndices = [1, 2, 3, 4, 5, 6, 0]; // Mon-Sun
    const dataPoints = await Promise.all(dayIndices.map(day => getTotalTimeSpentOnDay(day))); // This is all days from the previous week not the current week to today
    if (focusChart) {
    
      new Chart(focusChart, {
      type: "bar",
      data: {
        labels: weekdays,
        datasets: [{
          label: "Minutes",
          data: dataPoints,
          backgroundColor: "#4C7C78",
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false
          }
        }
      }
    
    });

    };

    let maximum = Math.max(...dataPoints);
    let dayindex = dataPoints.indexOf(maximum);


    BestDat.innerText = weekdays[dayindex];

    TotalFocus.innerText = await getTotalTimeSpentToday();

    SessionCount.innerText = await getTotalSessionsToday();

    AverageSession.innerText = await getAverageSessionTimeToday();

    const weekIndices = [4,3,2,1];
    const weekdataPoints = await Promise.all(weekIndices.map(week => getTotalTimeSpentOnWeek(week))); // This is all days from the previous week not the current week to today

    if (productivityChart) {
    new Chart(productivityChart, {
      type: "line",
      data: {
        labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
        datasets: [{
          label: "Productivity",
          data: weekdataPoints,
          borderColor: "#4C7C78",
          backgroundColor: "rgba(76, 124, 120, 0.2)",
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
    }

}

renderWork();

// if (focusChart) {
//   new Chart(focusChart, {
//     type: "bar",
//     data: {
//       labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
//       datasets: [{
//         label: "Hours",
//         data: [getTotalTimeSpentOnDay(1),getTotalTimeSpentOnDay(2),getTotalTimeSpentOnDay(3), getTotalTimeSpentOnDay(4),getTotalTimeSpentOnDay(5),getTotalTimeSpentOnDay(6), getTotalTimeSpentOnDay(0) ],
//         backgroundColor: "#4C7C78",
//         borderRadius: 8
//       }]
//     },
//     options: {
//       responsive: true,
//       plugins: {
//         legend: {
//           display: false
//         }
//       }
//     }
//   });
// }

// if (productivityChart) {
//   new Chart(productivityChart, {
//     type: "line",
//     data: {
//       labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
//       datasets: [{
//         label: "Productivity",
//         data: [40, 55, 48, 70],
//         borderColor: "#4C7C78",
//         backgroundColor: "rgba(76, 124, 120, 0.2)",
//         fill: true,
//         tension: 0.4
//       }]
//     },
//     options: {
//       responsive: true,
//       plugins: {
//         legend: {
//           display: false
//         }
//       }
//     }
//   });
// }