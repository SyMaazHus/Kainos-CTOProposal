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
  // test if workflow5 is added
  await page.getByRole('button', { name: 'New workflow' }).click();
  await page.locator('#taskName').fill('new task5');
  await page.locator('#taskDescription').fill('new task5 description');
  await page.getByRole('button', { name: 'Add workflow' }).click();

  await expect(page.locator('.workflow-card')).toHaveCount(5);
  await expect(page.getByText('new task5')).toBeVisible();
  await expect(page.getByText('new task5 description')).toBeVisible();
});

test('delete workflow', async ({ page }) => {
  await page.goto(webURL);
  // test if workflow deleted after button clicked
  await expect(page.locator(".workflow-card")).toHaveCount(4);
  const testCard = page.locator('.workflow-card').filter({hasText: 'Task 4' });
  await testCard.locator('.delete-clicked').click();
  await page.locator('#deleteConfirm').click();
  await expect(page.locator(".workflow-card")).toHaveCount(3);
});

test('status changed', async ({ page }) => {
  await page.goto(webURL);
  // test if status changed after cliked
  const testInactive = page.locator('.workflow-card').filter({hasText: 'file organisation' });
  await testInactive.locator('#status').click();
  await expect(testInactive).toHaveClass(/status-inactive/);

  const testActive = page.locator('.workflow-card').filter({hasText: 'Task 3' });
  await testActive.locator('#status').click();
  await expect(testActive).toHaveClass(/status-active/);
});
