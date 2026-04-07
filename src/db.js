import {app} from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sql from 'mssql';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AppDatabase {
    constructor(){
        this.config = {
            user: 'Project21Admin',
            password: 'Password1?',
            database: 'kainosdatabase',
            server: 'group21serverkainos.database.windows.net',
            pool: {
                max: 10,
                min: 0,
                idleTimeoutMillis: 30000
            },
            connectionTimeout: 60000,
            requestTimeout: 60000,
            options: {
                encrypt: true,
                trustServerCertificate: false
            }
        };
        this.pool = null;
    }

    async connect(){
        try{
            this.pool = await sql.connect(this.config);
        } catch(err){
            console.log("Failed to connect to Azure:", err);
        }
    }

    async getAllWorkflow(){
        const stmt = await this.pool.request().query('SELECT * FROM workflow');
        return stmt.recordset;
    }
    addTask(title,description){
        const stmt = this.db.prepare('INSERT INTO workflow (title,des,status,userID) VALUES (?,?,?,?)');
        const info = stmt.run(title,description,1,1);
        return{
            jobID: info.recordset.jobID,
            title: title,
            des: description,
            status: 1,
            userID: 1 //need refactor to assign userID
        };
    }
    deleteTask(jobID){
        const stmt = this.db.prepare('DELETE FROM workflow WHERE jobID = ?');
        const info = stmt.run(jobID);
        return info.changes > 0;
    }
    switchStatus(jobID,status){
        const stmt = this.db.prepare('UPDATE workflow SET status = ? WHERE jobID = ?');
        const info = stmt.run(status,jobID);
        return info.changes > 0;
    }

    async close(){
        if (this.pool){
            await this.pool.close();
        }
    }
}

export default AppDatabase;