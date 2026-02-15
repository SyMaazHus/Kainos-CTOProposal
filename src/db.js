import {app} from 'electron';
import path from 'node:path';
import Database from 'better-sqlite3';

class AppDatabase {
    constructor(){
        const dbPath = path.join(app.getPath('userData'),'UserPage.db');
        this.db = new Database(dbPath);
        this.db.pragma('journal_mode = WAL');
    }
    getAllWorkflow(){
        const stmt = this.db.prepare('SELECT * FROM workflow');
        return stmt.all();
    }
    close(){
        this.db.close();
    }
}
export default AppDatabase;