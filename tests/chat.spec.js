// @ts-check
import { test, expect } from '@playwright/test';

// change this to the URL of your website, could be local or GitHub pages
const websiteURL = 'http://127.0.0.1:3000/src/chat.html';

// Go to the website home page before each test.

test.beforeEach(async ({ page }) => {
   await page.goto(websiteURL);
});

// # html tests


//1
test('initial ui state', async ({ page }) => {
   const introBlock = page.locator('#introBlock');
    await expect(introBlock).toBeVisible();
    await expect(introBlock).toContainText("Hello. How's your day going?");


});

