// @ts-check
import { test, expect } from '@playwright/test';

// change this to the URL of your website, could be local or GitHub pages
const websiteURL = 'http://127.0.0.1:3000/src/chat.html';

// Go to the website home page before each test.

test.beforeEach(async ({ page }) => {
  await page.route('**/chat', async (route) => {
        const json = { reply: "This is a mocked response" };
        await route.fulfill({ json });
    });
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
    await expect(page.locator('#chatContainer')).not.toHaveClass(/active/);
  });

//5

test('Send Message and expect reponse', async ({ page }) => {
    // Type and press Enter
    await page.fill('#chatInput', 'Hello');
    await page.click('#sendBtn'); 

    await expect(page.locator('.message.user')).toContainText('Hello');

    const botBubble = page.locator('.message.bot');
    await expect(botBubble).toBeVisible();
    await expect(botBubble).toContainText('This is a mocked response');
  });

  
test('UI should switch to active mode on send', async ({ page }) => {
    await page.fill('#chatInput', 'Go');
    await page.click('#sendBtn');
    
   
    await expect(page.locator('#chatContainer')).toHaveClass(/active/);
});

// Future : we need navbar tests
