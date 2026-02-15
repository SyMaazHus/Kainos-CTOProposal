import { ipcMain } from "electron";

export default function workflowHandler(db){
    ipcMain.handle('workflow:getAllWorkflow', ()=>{
        return db.getAllWorkflow();})
}
