import { ipcMain } from "electron";

export default function workflowHandler(db){
    ipcMain.handle('workflow:getAllWorkflow', ()=>{
        return db.getAllWorkflow();})
    ipcMain.handle('workflow:addTask', (_,title,description)=>{
        return db.addTask(title,description);
    })
    ipcMain.handle('workflow:deleteTask',(_,jobID)=>{
        return db.deleteTask(jobID);
    })
}
