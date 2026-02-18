import { contextBridge, ipcRenderer } from "electron";

const apiWF = {
    getAllWorkflow: () => ipcRenderer.invoke('workflow:getAllWorkflow'),
    addTask: (title,description) => ipcRenderer.invoke('workflow:addTask',title,description),
    deleteTask: (jobID) => ipcRenderer.invoke('workflow:deleteTask',jobID),
    switchStatus: (jobID,status) => ipcRenderer.invoke('workflow:switchStatus',jobID,status)
}
contextBridge.exposeInMainWorld('apiWF', apiWF);
// window.apiWF = apiWF;