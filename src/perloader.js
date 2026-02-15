import { contextBridge, ipcRenderer } from "electron";

const apiWF = {
    getAllWorkflow: () => ipcRenderer.invoke('workflow:getAllWorkflow') 
}
contextBridge.exposeInMainWorld('api', apiWF)
