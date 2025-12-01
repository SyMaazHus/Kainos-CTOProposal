// src/main.js

const { app, BrowserWindow } = require('electron');
const path = require('path'); 
const { spawn } = require('child_process');

try {
  require('electron-reloader')(module);
} catch (_) {}

function createWindow () {
  const mainWindow = new BrowserWindow({
    
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'dashboard.html'));
}

function startPythonServer() {
    const scriptPath = path.join(__dirname, 'server.py');
    console.log("Starting Python server at:", scriptPath);
    pythonProcess = spawn('python', [scriptPath]); //Creates the process from getting server.py file (like running py on terminal)

    pythonProcess.stdout.on('data', (data) => {
        console.log(`[Python]: ${data}`);
    });

    // pythonProcess.stderr.on('data', (data) => {
    //     console.error(`[Python Error]: ${data}`);
    // });
}

function startPythonServer() {
    const scriptPath = path.join(__dirname, 'server.py');
    console.log("Starting Python server at:", scriptPath);
    pythonProcess = spawn('python', [scriptPath]); //Creates the process from getting server.py file (like running py on terminal)

    pythonProcess.stdout.on('data', (data) => {
        console.log(`[Python]: ${data}`);
    });

    // pythonProcess.stderr.on('data', (data) => {
    //     console.error(`[Python Error]: ${data}`);
    // });
}

app.whenReady().then(() => {
  startPythonServer();
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

//Kill python back-end when quiting window
app.on('will-quit', () => {
    if (pythonProcess) {
        pythonProcess.kill();
    }
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});