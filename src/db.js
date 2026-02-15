import {app} from 'electron';
import path from 'node:path';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AppDatabase {
    constructor(){
        const dbPath = path.join(__dirname,'database','UserPage.db');
        this.db = new Database(dbPath);
        this.db.pragma('journal_mode = WAL');
    }
    getAllWorkflow(){
        const stmt = this.db.prepare('SELECT * FROM workflow');
        return stmt.all();
    }
    addTask(title,description){
        const stmt = this.db.prepare('INSERT INTO workflow (title,des) VALUES (?)');
        const info = stmt.run(title,description);
        return{
            jobID: info.lastInsertRowid,
            title: title,
            des: description,
            status: 1,
            userID: 1 //need refactor to assign userID
        }
    }
    deleteTask(jobID){
        const stmt = this.db.prepare('DELETE FROM workflow WHERE jobID = ?');
        const info = stmt.run(jobID);
        return info.changes > 0;
    }
    switchStatus(jobID){
        
    }
    close(){
        this.db.close();
    }
}
export default AppDatabase;