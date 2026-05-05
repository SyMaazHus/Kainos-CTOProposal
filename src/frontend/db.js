import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sql from 'mssql';

let app;
try {
    const electron = await import('electron');
    app = electron.app;
} catch (e) {
    app = null;
}
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
    //query getting all data from workflow table
    async getAllWorkflow(){
        const stmt = await this.pool.request().query('SELECT * FROM workflow');
        return stmt.recordset;
    }
    //query for adding new data into workflow table from workflowhub page
    //title:task title, description: task description, intent: intention of task, confidence: confidence score for AI, rule: condition of task
    async addTask(title, description, intent, confidence, rule){
        const conf = Number(confidence);
        const ruleText = JSON.stringify(rule || {});

        const info = await this.pool.request()
            .input('title', sql.NVarChar, title)
            .input('des', sql.NVarChar, description)
            .input('status', sql.Int, 1)
            .input('userID', sql.Int, 1)
            .input('intention', sql.NVarChar, intent)
            .input('confidence', sql.Float, Number.isFinite(conf) ? conf : 0)
            .input('workflowRule', sql.NVarChar(sql.MAX), ruleText)
            .query(`
                INSERT INTO workflow (title, des, status, userID, intention, confidence, workflowRule)
                OUTPUT INSERTED.jobID
                VALUES (@title, @des, @status, @userID, @intention, @confidence, @workflowRule)
            `);

        return {
            jobID: info.recordset[0].jobID,
            title,
            des: description,
            status: 1,
            userID: 1,
            intention: intent,
            confidence: Number.isFinite(conf) ? conf : 0,
            workflowRule: ruleText
        };
    }
    //query deleting task by jobID
    async deleteTask(jobID){
        const info = await this.pool.request()
                    .input('jobID', sql.Int, jobID)
                    .query('DELETE FROM workflow WHERE jobID = @jobID');

        return info.rowsAffected && info.rowsAffected[0] > 0;
    }
    //query switch the current status
    //jobID: task ID, status: task status
    async switchStatus(jobID,status){
        const info = await this.pool.request()
                    .input('status', sql.Int, status)
                    .input('jobID', sql.Int, jobID)
                    .query('UPDATE workflow SET status = @status WHERE jobID = @jobID');

        console.log(`   DEBUG: Update JobID ${jobID} result:`, info.rowsAffected);
        return info.rowsAffected && info.rowsAffected[0] > 0;
    }
    //query fetching user's information from setting table
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
    //query updating user's information 
    //displayName: username, email: user's email, phone: user's phone number, notifications: 
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

    //query updating user's personal profile
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
    //query record activity time spent 
    //timeSpent: total time spent on task, taskName: task name, dateLogged: date of task addition(DDMMYYYY), currentTime: task complete time
    async addTimeActivity(timeSpent, taskName, dateLogged, currentTime){
        try {
            const result = await this.pool.request()
                .input('Task', sql.NVarChar, taskName)
                .input('TimeSpent', sql.Int, timeSpent)
                .input('DateAddedDB', sql.Int, dateLogged)
                .input('TimeLogged', sql.Int, currentTime)
                .input('UserID', sql.Int, 1)
                .query(`
                    INSERT INTO Insights (userID,TimeSpent,Task,DateAddedDB,TimeLogged) 
                    OUTPUT INSERTED.TaskID VALUES(@UserID,@TimeSpent,@Task,@DateAddedDB,@TimeLogged)
                `);
            return result.rowsAffected[0] > 0;
        } catch (err) {
            console.error("SQL updateTimeActivity error:", err);
            return false;
        }
    }
    //query fetching time spent data by dateLogged
    //dateLogged: date of task addition(DDMMYYYY)
    async getTimeSpentFromDate(dateLogged){
        try{
            const result = await this.pool.request()
                .input("DateAddedDB",sql.Int, dateLogged)
                .query(`
                   SELECT * FROM Insights WHERE DateAddedDB=@DateAddedDB 
                `);
            return result.recordset;
        } catch (err) {
            console.error("SQL getTimeSpent error:", err);
            return false;
        }
    }

    //query fetching all active task in workflow table
    async getActiveWorkflows(){
        try {
            const stmt = await this.pool.request()
                .query(`SELECT * FROM workflow WHERE status = 1`);
            return stmt.recordset;
        }
        catch (err) {
            console.error("SQL get active workflows:", err);
            return false;
        }
    }
     //query fetching all inactive task in workflow table
    async getPassiveWorkflows(){
        try {
            const stmt = await this.pool.request()
                .query(`SELECT * FROM workflow WHERE status = 0`);
            return stmt.recordset;
        }
        catch (err) {
            console.error("SQL get passive workflows:", err);
            return false;
        }
    }
     //query fetching top most recent task from dashboard table
    async getTimeTable(){
        try {
            const stmt = await this.pool.request()
                .query(`SELECT TOP 7 * FROM Insights ORDER BY TaskID DESC`);
            return stmt.recordset;
        }
        catch (err) {
            console.error("SQL get time table:", err);
            return false;
        }
    }

    async close(){
        if (this.pool){
            await this.pool.close();
        }
    }
    //query updating latest sumarised note
    async updateWorkflowProcessedPage(jobID, pageId){
        const result = await this.pool.request()
            .input('jobID', sql.Int, jobID)
            .input('pageId', sql.NVarChar, pageId)
            .query(`
                UPDATE workflow
                SET lastProcessedPageId = @pageId,
                    lastRun = GETDATE()
                WHERE jobID = @jobID
            `);
        return result.rowsAffected[0] > 0;
    }
}

export default AppDatabase;