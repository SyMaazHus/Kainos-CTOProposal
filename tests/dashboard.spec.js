// @ts-check
import { test, expect } from '@playwright/test';

// change this to the URL of your website, could be local or GitHub pages


const PORT = process.env.PORT || 3000;

const websiteURL = `http://127.0.0.1:${PORT}/src/dashboard.html`;

// Go to the website home page before each test.

test.beforeEach(async ({ page }) => {
   await page.goto(websiteURL);
});



// Test 1 - Title is correct
test('Dashboard Headding', async ({ page }) => {
    await expect(page.locator('page-title').getByText('Your Dashboard')).toBeVisible();
});


// Test 2 - Test nav bar links work
test('Navbar Links', async ({ page }) => {

   // Click the 'vehicle search' link.
   await page.getByRole('link', { name: 'Vehicle search' }).click();

   // Expects page to have a heading 'Vehicle search'.
   await expect(page.locator('page-title').getByText('Your Dashboard')).toBeVisible();
});