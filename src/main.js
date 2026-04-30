// src/main.js

// const { app, BrowserWindow } = require('electron');
// const path = require('path'); 
// const { spawn } = require('child_process');

import {app,BrowserWindow} from 'electron';
import path from 'node:path';
import {spawn} from 'node:child_process';

import AppDatabase from './db.js';
import workflowHandler from './ipcHandler.js';
import { fileURLToPath } from 'node:url';

import { handleWorkflow } from './workflowExecutor.js';

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
      preload: path.join(__dirname,'preloader.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
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

    pythonProcess.stderr.on('data', (data) => {
        console.error(`[Python Error]: ${data}`);
    });
}


app.whenReady().then( async () => {
  db = new AppDatabase;
  await db.connect();
  workflowHandler(db);
  startPythonServer();
  createWindow();

  setInterval(async () => {

    console.log("Scheduler running...");

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