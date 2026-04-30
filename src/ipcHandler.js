import { ipcMain } from "electron";

export default function workflowHandler(db){
    ipcMain.handle('workflow:getAllWorkflow', async ()=>{
        return await db.getAllWorkflow();})
    ipcMain.handle('workflow:addTask', async (_, title, description, intent, confidence, rule) => {
        return await db.addTask(title, description, intent, confidence, rule || {});
    });
    ipcMain.handle('workflow:deleteTask', async (_,jobID)=>{
        return await db.deleteTask(jobID);
    });
    ipcMain.handle('workflow:switchStatus', async (_,jobID,status)=>{
        return await db.switchStatus(jobID,status);
    })
    ipcMain.handle('workflow:analyseTask', async (_, description) => {
        const response = await fetch('http://127.0.0.1:5000/analyse-workflow', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ description })
        });
        return await response.json();
    });


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
    });
    
    ipcMain.handle('insights:getTimeSpentFromDate', async (_, dateLogged)=>{
        return await db.getTimeSpentFromDate(dateLogged);
    })


}

