import {app} from 'electron';
import path from 'node:path';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'node:url';
import sql from 'mssql';

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

    async addTask(title,description){
        const info = await this.pool.request()
                    .input('title',sql.NVarChar,title)
                    .input('des',sql.NVarChar,description)
                    .input('status',sql.Int,1)
                    .input('userID',sql.Int,1)
                    .query('INSERT INTO workflow (title,des,status,userID) OUTPUT INSERTED.jobID VALUES(@title,@des,@status,@userID)');
        return{
            jobID: info.recordset.jobID,
            title: title,
            des: description,
            status: 1,
            userID: 1 //need refactor to assign userID
        };
    }

    async deleteTask(jobID){
        const info = await this.pool.request()
                    .input('jobID', sql.Int, jobID)
                    .query('DELETE FROM workflow WHERE jobID = @jobID');
        return info.rowAffected > 0;
    }

    async switchStatus(jobID,status){
        const info = await this.pool.request()
                    .input('status', sql.Int, status)
                    .input('jobID', sql.Int, jobID)
                    .query('UPDATE workflow SET status = @status WHERE jobID = @jobID');
        return info.rowAffected > 0;
    }
    close(){
        this.db.close();
    }
}
export default AppDatabase;