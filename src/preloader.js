import { contextBridge, ipcRenderer } from "electron";

const apiWF = {
    getAllWorkflow: () => ipcRenderer.invoke('workflow:getAllWorkflow'),
    addTask: (title,description) => ipcRenderer.invoke('workflow:addTask',title,description),
    deleteTask: (jobID) => ipcRenderer.invoke('workflow:deleteTask',jobID),
    deleteTask: (jobID) => ipcRenderer.invoke('workflow:deleteTask',jobID),
    switchStatus: (jobID,status) => ipcRenderer.invoke('workflow:switchStatus',jobID,status)
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

contextBridge.exposeInMainWorld('apiST', apiST);
contextBridge.exposeInMainWorld('apiWF', apiWF);
contextBridge.exposeInMainWorld('apiDB', apiDB);
// window.apiWF = apiWF;

