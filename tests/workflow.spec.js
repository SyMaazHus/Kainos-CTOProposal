import { test, expect } from '@playwright/test';
const webURL = "http://127.0.0.1:3000/src/workflow.html?serverWindowId=14dc6d7b-3502-418f-82b4-518e81bd2a67";
test.beforeEach(async ({ page }) => {
  await page.goto(webURL);
});

test('has title', async ({ page }) => {
  await page.goto(webURL);

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Workflow Hub/);
});

test('add workflow', async ({ page }) => {
  await page.goto(webURL);
  //test if workflow5 is added
  await page.getByRole('button', { name: 'New workflow' }).click();
  await page.locator('#taskName').fill('new task');
  await page.locator('#taskDescription').fill('new task description');
  await page.getByRole('button', { name: 'Add workflow' }).click();

  await expect(page.locator(".workflow-card")).toHaveCount(5)
});


