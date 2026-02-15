import { ipcMain } from "electron";

export default function workflowHandler(db){
    ipcMain.handle('workflow:getAll', ()=>{
        return db.getAllWorkflow();})
}