// @ts-check
import { test, expect } from '@playwright/test';
import { getPackedSettings } from 'http2';

// change this to the URL of your website, could be local or GitHub pages


const PORT = process.env.PORT || 3000;

const websiteURL = `http://127.0.0.1:3000/src/dashboard.html`;

// Go to the website home page before each test.

test.beforeEach(async ({ page }) => {
   await page.goto(websiteURL);
});



// Test 1 - Title is correct
test('Dashboard Headding', async ({ page }) => {

    const headingTitle = page.locator('H1');

    await expect(headingTitle).toContainText("Your Dashboard");
});

// Test 2 - Test chat button
test('Chat Buttons Link', async ({ page }) => {
   const ChatButton = page.locator(".ChatButton");
   // Click on the chat button 
   await ChatButton.click();
   await page.waitForURL('http://127.0.0.1:3000/src/chat.html');
});

// Following tests for the navigation bar
// Note that I had to add the id for each of the nav bar tests

// Test 3 - Test Nav Button - Chat
test('Chat Nav', async ({ page }) => {
   // Click on the chat button 
   await page.click("#chat-nav");
   await page.waitForURL('http://127.0.0.1:3000/src/chat.html');
});

// Test 4 - Test Nav Button - Calendar
// This one fails as it should as we have not implemented a calendar page
test('Calendar Nav', async ({ page }) => {
   // Click on the chat button 
   await page.click("#calendar-nav");
   await page.waitForURL('http://127.0.0.1:3000/src/calendar.html');
});


// Test 5 - Test Nav Button - Logo
test('logo Nav', async ({ page }) => {
   // Click on the chat button 
   await page.click("#logo");
   await page.waitForURL('http://127.0.0.1:3000/src/dashboard.html');
});

// Test 6 - Test Nav Button - Workflow
test('workflow Nav', async ({ page }) => {
   // Click on the chat button 
   await page.click("#workflow-nav");
   await page.waitForURL('http://127.0.0.1:3000/src/workflow.html');
});

// Test 7 - Test Nav Button - Insights
test('insights Nav', async ({ page }) => {
   // Click on the chat button 
   await page.click("#insights-nav");
   await page.waitForURL('http://127.0.0.1:3000/src/insights.html');
});

// Test 8 - Test Nav Button - Settings
test('settings Nav', async ({ page }) => {
   // Click on the chat button 
   const settingbutton = page.getByLabel("Settings");

   await settingbutton.click();
   await page.waitForURL('http://127.0.0.1:3000/src/setting.html');
});