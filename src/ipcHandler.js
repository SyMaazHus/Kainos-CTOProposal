import { ipcMain } from "electron";

export default function workflowHandler(db){
    ipcMain.handle('workflow:getAllWorkflow', async ()=>{
        return await db.getAllWorkflow();})
    ipcMain.handle('workflow:addTask', async (_,title,description)=>{
        return await db.addTask(title,description);
    });
    ipcMain.handle('workflow:deleteTask', async (_,jobID)=>{
        return await db.deleteTask(jobID);
    });
    ipcMain.handle('workflow:switchStatus', async (_,jobID,status)=>{
        return await db.switchStatus(jobID,status);
    })


    // setting

    ipcMain.handle('settings:getSetting', async () => {
        return await db.getSetting();
    });
    ipcMain.handle('settings:updateSetting', async (_, displayName, email, phone, notifications) => {
        return await db.updateSetting(displayName, email, phone, notifications);
    });

    ipcMain.handle('settings:updateAvatar', async (_, base64) => {
        return await db.updateAvatar(base64);
    });

    // Dashboard

    ipcMain.handle('dashboard:getActiveWorkflows', async ()=>{
        return await db.getActiveWorkflows();
    });
    
    ipcMain.handle('dashboard:getPassiveWorkflows', async ()=>{
        return await db.getPassiveWorkflows();
    });

    ipcMain.handle('dashboard:getTimeTable', async ()=>{
        return await db.getTimeTable();
    });

    // Insights

    ipcMain.handle('insights:addTimeActivity', async (_,timeSpent, taskName, dateLogged, currentTime)=>{
        return await db.addTimeActivity(timeSpent, taskName, dateLogged, currentTime);
    })


}

