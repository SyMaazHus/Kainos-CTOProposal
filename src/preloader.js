import { contextBridge, ipcRenderer } from "electron";

const apiWF = {
    getAllWorkflow: () => ipcRenderer.invoke('workflow:getAllWorkflow'),
    addTask: (title,description) => ipcRenderer.invoke('workflow:add',title,description),
    deleteTask: (jobID) => ipcRenderer.invoke('workflow:delete',jobID),
    getAllDashboard: () => ipcRenderer.invoke('dashboard:getAllDashboard')
}

const apiST = {
    getSetting: () => ipcRenderer.invoke('settings:getSetting'),
    updateSetting: (displayName, email, phone, notifications) => 
        ipcRenderer.invoke('settings:updateSetting', displayName, email, phone, notifications),
    updateAvatar: (base64) => ipcRenderer.invoke('settings:updateAvatar', base64)
}

contextBridge.exposeInMainWorld('apiST', apiST);
contextBridge.exposeInMainWorld('apiWF', apiWF);
// window.apiWF = apiWF;

