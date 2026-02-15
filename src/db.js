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
    addTask(){
        const stmt = this.db.pre
    }
    deletetask(){

    }
    close(){
        this.db.close();
    }
}
export default AppDatabase;