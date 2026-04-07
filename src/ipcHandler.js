import { ipcMain } from "electron";

export default function workflowHandler(db){
    ipcMain.handle('workflow:getAllWorkflow', async ()=>{
        return await db.getAllWorkflow();})
    ipcMain.handle('workflow:addTask', async (_,title,description)=>{
        return await db.addTask(title,description);
    })
    ipcMain.handle('workflow:deleteTask', async (_,jobID)=>{
        return await db.deleteTask(jobID);
    })
    ipcMain.handle('workflow:switchStatus', async (_,jobID,status)=>{
        return await db.switchStatus(jobID,status);
    })
}
