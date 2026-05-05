import {app,BrowserWindow} from 'electron';
import path from 'node:path';
import {spawn} from 'node:child_process';

import AppDatabase from './db.js';
import workflowHandler from './ipcHandler.js';
import { fileURLToPath } from 'node:url';

import { handleWorkflow } from '../frontend/workflow/workflowExecutor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db;
let pythonProcess;
try {
  require('electron-reloader')(module);
} catch (_) {}

function createWindow () {
  const mainWindow = new BrowserWindow({
    
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname,'preloader.js'), //preload file bridge database API
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    }
  });
  //display dashboard page as a deafault page
  mainWindow.loadFile(path.join(__dirname, './dashboard/dashboard.html'));
}

function startPythonServer() {
    const scriptPath = path.join(__dirname, '../server.py');
    console.log("Starting Python server at:", scriptPath);
    pythonProcess = spawn('python', [scriptPath]); //Creates the process from getting server.py file (like running py on terminal)

    pythonProcess.stdout.on('data', (data) => {
        console.log(`[Python]: ${data}`);
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`[Python Error]: ${data}`);
    });
}


app.whenReady().then( async () => {
  db = new AppDatabase;
  await db.connect();
  workflowHandler(db);
  
  // Start the Python Server
  startPythonServer();
  
  // Attempt to connect to python server if ready, if not retry until success
  const checkPythonReady = async (retries = 10) => {
        // run attempt loops
        for (let i = 0; i < retries; i++) {
            try {
                console.log(`Pinging Python server (Attempt ${i + 1}/10)...`);
                // connect to the Login from server.py
                const response = await fetch('http://127.0.0.1:5000/login');
                
                if (response.ok) {
                    console.log("Python is awake and authenticated! Launching Dashboard...");
                    createWindow(); // Open Window (Dashboard) when success
                    return; 
                }
            } catch (err) {
                console.log("Server not ready yet, retrying.."); // log an unsuccessful attempt
                await new Promise(resolve => setTimeout(resolve, 1500));
            }
        }
        console.error("Fatal: Could not connect to Python server."); // No success after several loops
    };

    // Run Loop
    checkPythonReady();

  setInterval(async () => {

    console.log("Scheduler running...");
    //wait for database connection
    const workflows = await db.getActiveWorkflows();

    for (const wf of workflows) {
        handleWorkflow(wf, db);
    }

  }, 60000);

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
  db.close();
  if (process.platform !== 'darwin') app.quit();
});