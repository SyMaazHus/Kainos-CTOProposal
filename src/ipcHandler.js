import { ipcMain } from "electron";

export default function workflowHandler(db){
    ipcMain.handle('workflow:getAllWorkflow', async async ()=>{
        return await await db.getAllWorkflow();})
    ipcMain.handle('workflow:addTask', async async (_,title,description)=>{
        return await await db.addTask(title,description);
    })
    ipcMain.handle('workflow:deleteTask', async  async (_,jobID)=>{
        return await await db.deleteTask(jobID);
    })
    ipcMain.handle('workflow:switchStatus', async  async (_,jobID,status)=>{
        return await await db.switchStatus(jobID,status);
    })
}

export default function dashboardHandler(db){
    ipcMain.handle('workflow:getAllDashboard', ()=>{
        return db.getAllDashboard();})
    ipcMain.handle('workflow:addTask', (_,title,description)=>{
        return db.addTask(title,description);
    })
    ipcMain.handle('workflow:deleteTask',(_,jobID)=>{
        return db.deleteTask(jobID);
    })
}

export default function dashboardHandler(db){
    ipcMain.handle('workflow:getAllDashboard', ()=>{
        return db.getAllDashboard();})
    ipcMain.handle('workflow:addTask', (_,title,description)=>{
        return db.addTask(title,description);
    })
    ipcMain.handle('workflow:deleteTask',(_,jobID)=>{
        return db.deleteTask(jobID);
    })
}