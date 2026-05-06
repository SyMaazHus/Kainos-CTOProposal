import { test, expect } from '@playwright/test';
import AppDatabase from '../src/db.js';


test.describe('Azure Database Basic Integration', () => {
    let db;

    test.beforeAll(async () => {
        db = new AppDatabase();
        await db.connect();
    });

    test.afterAll(async () => {
        if (db) await db.close();
    });

    test('should verify connection to Azure SQL', async () => {
        expect(db.pool).toBeDefined();
        expect(db.pool.connected).toBeTruthy();
    });

    test('should fetch data from workflow table', async () => {
        const data = await db.getAllWorkflow();
        console.log('   Current Azure Data Count:', data.length);
        expect(Array.isArray(data)).toBe(true);
    });

    test('should check if UserID 1 exists in Setting', async () => {
        const settings = await db.getSetting();
        if (settings) {
            expect(settings).toHaveProperty('email');
        }
    });
});


// setting
test.describe('Azure Settings Integration', () => {
    let db;

    test.beforeAll(async () => {
        db = new AppDatabase();
        await db.connect();
    });

    test.afterAll(async () => {
        if (db) await db.close();
    });

    test('should fetch and update user settings', async () => {
        const originalSettings = await db.getSetting();
        expect(originalSettings).toBeDefined();

        const newName = "TestUser_" + Math.floor(Math.random() * 1000);
        const updateSuccess = await db.updateSetting(newName, "test@kainos.com", "123456789", 0);
        expect(updateSuccess).toBe(true);

        const updatedSettings = await db.getSetting();
        expect(updatedSettings.displayName).toBe(newName);
        console.log('   Successfully updated name to:', updatedSettings.displayName);
    });

    test('should update avatar base64 string', async () => {
        const fakeBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
        const success = await db.updateAvatar(fakeBase64);
        expect(success).toBe(true);

        const settings = await db.getSetting();
        expect(settings.pfp).toBe(fakeBase64);
    });
});


// workflow
test.describe.serial('Azure Workflow Lifecycle Integration', () => {
    let db;
    let tempJobID;

    test.beforeAll(async () => {
        db = new AppDatabase();
        await db.connect();
    });

    test.afterAll(async () => {
        if (db) await db.close();
    });

    test('Step 1: addTask should save to Azure', async () => {
        const result = await db.addTask("Serial Test " + Date.now(), "Testing...");
        expect(result).toHaveProperty('jobID');
        tempJobID = result.jobID; 
        console.log(`   Task created with ID: ${tempJobID}`);
    });

    test('Step 2: verifyTask exists', async () => {
        expect(tempJobID).toBeDefined();
        const tasks = await db.getAllWorkflow();
        const found = tasks.find(t => t.jobID === tempJobID);
        expect(found).toBeDefined();
    });

    test('Step 3: switchStatus to Passive', async () => {
        expect(tempJobID).toBeDefined();
        console.log('   Checking status switch for ID:', tempJobID);
        const success = await db.switchStatus(tempJobID, 0);
        expect(success).toBe(true);
    });

    test('Step 4: deleteTask', async () => {
        expect(tempJobID).toBeDefined();
        const success = await db.deleteTask(tempJobID);
        expect(success).toBe(true);
        console.log('   Task deleted successfully');
    });

// dashboard
test.describe('Azure Dashboard Data Integration', () => {
    let db;

    test.beforeAll(async () => {
        db = new AppDatabase();
        await db.connect();
    });

    test.afterAll(async () => {
        if (db) await db.close();
    });

    test('should distinguish between Active and Passive workflows', async () => {
    
        const activeTasks = await db.getActiveWorkflows();
        expect(Array.isArray(activeTasks)).toBe(true);
        
     
        const passiveTasks = await db.getPassiveWorkflows();
        expect(Array.isArray(passiveTasks)).toBe(true);

     
        if (activeTasks.length > 0) {
            expect(activeTasks[0].status).toBe(1);
        }
        
        console.log(`   Dashboard Stats -> Active: ${activeTasks.length}, Passive: ${passiveTasks.length}`);
    });

    test('should fetch and format TimeTable (Insights)', async () => {
        const times = await db.getTimeTable();
        expect(Array.isArray(times)).toBe(true);
        
        if (times.length > 0) {
            const firstEntry = times[0];
          
            expect(firstEntry).toHaveProperty('Task');
            expect(firstEntry).toHaveProperty('TimeSpent');
            
           
            const timeHourValue = firstEntry.TimeSpent / 60;
            expect(typeof timeHourValue).toBe('number');
            console.log(`   Sample Insight: Task "${firstEntry.Task}" spent ${timeHourValue.toFixed(2)} hours`);
        } else {
            console.log('   Note: Insights table is empty, skipping detailed property checks.');
        }
    });
});

});