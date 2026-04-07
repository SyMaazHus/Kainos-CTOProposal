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

        async getSetting() {
        try {

            const result = await this.pool.request()
                .input('userID', sql.Int, 1) 
                .query(`
                    SELECT 
                        UserName as displayName,
                        Email as email,
                        PhoneNumber as phone,
                        Notifications as notifications,
                        PFP as pfp
                    FROM UserPage
                    WHERE UserID = @userID
                `);
            
            return result.recordset[0];
        } catch (err) {
            console.error("SQL getSetting error:", err);
            throw err;
        }
    }

        async updateSetting(displayName, email, phone, notifications) {
        try {
            const result = await this.pool.request()
                .input('name', sql.NVarChar, displayName)
                .input('email', sql.NVarChar, email)
                .input('phone', sql.NVarChar, phone)
                .input('notify', sql.Int, notifications)
                .input('userID', sql.Int, 1)
                .query(`
                    UPDATE UserPage 
                    SET UserName = @name, 
                        Email = @email, 
                        PhoneNumber = @phone,
                        Notifications = @notify
                    WHERE UserID = @userID
                `);


            return result.rowsAffected[0] > 0;
        } catch (err) {
            console.error("SQL updateSetting error:", err);
            return false;
        }
    }


        async updateAvatar(base64) {
        try {
            const result = await this.pool.request()
                .input('pfp', sql.NVarChar(sql.MAX), base64) 
                .input('userID', sql.Int, 1)
                .query(`
                    UPDATE UserPage
                    SET PFP = @pfp
                    WHERE UserID = @userID
                `);

            return result.rowsAffected[0] > 0;
        } catch (err) {
            console.error("SQL updateAvatar error:", err);
            return false;
        }
    }



    async close(){
        if (this.pool){
            await this.pool.close();
        }
    }
}
export default AppDatabase;