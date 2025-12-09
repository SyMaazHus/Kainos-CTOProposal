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

//2 
test('Send Message using Enter Key', async ({ page }) => {
    // Type and press Enter
    await page.fill('#chatInput', 'Pressing Enter works');
    await page.press('#chatInput', 'Enter');

    // Verify message sent
    await expect(page.locator('.message.user')).toContainText('Pressing Enter works');
    await expect(page.locator('#chatInput')).toBeEmpty();
  });
//3

test('Send Message using Send button', async ({ page }) => {
    // Type and press Enter
    await page.fill('#chatInput', 'Pressing Send works');
    await page.click('#sendBtn'); 

    // Verify message sent
    await expect(page.locator('.message.user')).toContainText('Pressing Send works');
    await expect(page.locator('#chatInput')).toBeEmpty();
  });


//4
test('Prevent sending empty messages', async ({ page }) => {
    await page.click('#sendBtn');

    //expect no changes 
    await expect(page.locator('#chatContainer')).not.toHaveClass(/active/);
    await expect(page.locator('.message')).toHaveCount(0);
    
    // Type whitespace and try to send
    await page.fill('#chatInput', '   ');
    await page.click('#sendBtn');
    
    // Verify still nothing happened
    await expect(page.locator('.message')).toHaveCount(0);
  });

//5

test('Send Message and expect reponse', async ({ page }) => {
    // Type and press Enter
    await page.fill('#chatInput', 'Hello');
    await page.click('#sendBtn'); 

    const botBubble = page.locator('.message.bot').first();
    await expect(botBubble).toBeVisible();
    // Bot message should be one of the random replies from your array
    // Verify message sent
    await expect(page.locator('.message.user')).toContainText('Hello');
    await expect(page.locator('#chatInput')).toBeEmpty();
  });


// Future : we need navbar tests
