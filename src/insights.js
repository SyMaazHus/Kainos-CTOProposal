
// This takes note of the time when the session started
let startTime = null;
let timerInterval = null;

const taskInput = document.getElementById("taskInput");
const startBtn = document.getElementById("startBtn");
const finishBtn = document.getElementById("finishBtn");
const activeSession = document.getElementById("activeSession");
const activeTask = document.getElementById("activeTask");
const timerDisplay = document.getElementById("timer");

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

    // We need the current time in the format hrsmins
    // Time spent, Task name, Task date added, time added

    // We need the currentdate in the format DDMMYYYY

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


//   finishBtn.addEventListener("click", () => {
//     // Here is the timer being saved to the database

//     // We need the current time in the format hrsmins

//     // We need the currentdate in the format DDMMYYYY

//     await window.apiIS.addTimeActivity(10,localStorage.getItem("activeTask"),27042006,0o0);

//     clearInterval(timerInterval);
//     localStorage.removeItem("activeTask");
//     localStorage.removeItem("startTime");

//     taskInput.value = "";
//     taskInput.disabled = false;
//     activeSession.style.display = "none";
//     startBtn.style.display = "inline-block";
//     finishBtn.style.display = "none";
//     timerDisplay.textContent = "00:00:00";
//   });

//   // Restores the session if app reloads
//   const savedTask = localStorage.getItem("activeTask");
//   const savedStart = localStorage.getItem("startTime");

//   if (savedTask && savedStart) {
//     startTime = Number(savedStart);
    
//     // Restores the task input
//     taskInput.value = savedTask;
//     taskInput.disabled = true;

//     activeTask.textContent = savedTask;
//     activeSession.style.display = "block";
//     startBtn.style.display = "none";
//     finishBtn.style.display = "inline-block";
   
//     // Restarts the timer
//     startTimer();
//   }
// });

const focusChart = document.getElementById("focusChart");
const productivityChart = document.getElementById("productivityChart");

if (focusChart) {
  new Chart(focusChart, {
    type: "bar",
    data: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      datasets: [{
        label: "Hours",
        data: [2, 1.5, 3, 2.5, 1],
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
}

if (productivityChart) {
  new Chart(productivityChart, {
    type: "line",
    data: {
      labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
      datasets: [{
        label: "Productivity",
        data: [40, 55, 48, 70],
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