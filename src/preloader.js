import { contextBridge, ipcRenderer } from "electron";

const apiWF = {
    getAllWorkflow: () => ipcRenderer.invoke('workflow:getAllWorkflow'),
    addTask: (title, description, intent, confidence, rule) =>
    ipcRenderer.invoke('workflow:addTask', title, description, intent, confidence, rule),
    deleteTask: (jobID) => ipcRenderer.invoke('workflow:deleteTask',jobID),
    switchStatus: (jobID,status) => ipcRenderer.invoke('workflow:switchStatus',jobID,status),
    analyseTask: (description) => ipcRenderer.invoke('workflow:analyseTask', description),
}

const apiST = {
    getSetting: () => ipcRenderer.invoke('settings:getSetting'),
    updateSetting: (displayName, email, phone, notifications) => 
        ipcRenderer.invoke('settings:updateSetting', displayName, email, phone, notifications),
    updateAvatar: (base64) => ipcRenderer.invoke('settings:updateAvatar', base64)
}

const apiDB = {
    getActiveWorkflows: () => ipcRenderer.invoke('dashboard:getActiveWorkflows'),
    getPassiveWorkflows: () => ipcRenderer.invoke('dashboard:getPassiveWorkflows'),
    getTimeTable: () => ipcRenderer.invoke('dashboard:getTimeTable')
}

const apiIS = {
    addTimeActivity: (timeSpent, taskName, dateLogged, currentTime) => ipcRenderer.invoke('insights:addTimeActivity',timeSpent, taskName, dateLogged, currentTime),
    getTimeSpentFromDate: (dateLogged) => ipcRenderer.invoke('insights:getTimeSpentFromDate', dateLogged)
}


contextBridge.exposeInMainWorld('apiST', apiST);
contextBridge.exposeInMainWorld('apiWF', apiWF);
contextBridge.exposeInMainWorld('apiDB', apiDB);
contextBridge.exposeInMainWorld('apiIS', apiIS);

// window.apiWF = apiWF;

