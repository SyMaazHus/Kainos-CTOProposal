
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

  finishBtn.addEventListener("click", () => {
    clearInterval(timerInterval);
    localStorage.removeItem("activeTask");
    localStorage.removeItem("startTime");

    taskInput.value = "";
    taskInput.disabled = false;
    activeSession.style.display = "none";
    startBtn.style.display = "inline-block";
    finishBtn.style.display = "none";
    timerDisplay.textContent = "00:00:00";
  });

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
