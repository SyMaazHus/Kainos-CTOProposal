import { contextBridge, ipcRenderer } from "electron";

const apiWF = {
    getAllWorkflow: () => ipcRenderer.invoke('workflow:getAllWorkflow'),
    addTask: (title,description) => ipcRenderer.invoke('workflow:add',title,description),
    deleteTask: (jobID) => ipcRenderer.invoke('workflow:delete',jobID)
}
contextBridge.exposeInMainWorld('apiWF', apiWF);
// window.apiWF = apiWF;