import { test, expect } from '@playwright/test';
const webURL = "http://127.0.0.1:3000/src/workflow.html?serverWindowId=14dc6d7b-3502-418f-82b4-518e81bd2a67";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {

    let workflows = [
      { jobID: 1, title: 'test task', des: 'desc', status: 1 }
    ];

    window.apiWF = {
      getAllWorkflow: async () => workflows,

      addTask: async (title, des) => {
        const newTask = {
          jobID: Date.now(),
          title,
          des,
          status: 1
        };
        workflows.push(newTask);
      },

      deleteTask: async (id) => {
        workflows = workflows.filter(w => w.jobID !== id);
      },

      switchStatus: async (id, newStatus) => {
        const task = workflows.find(w => w.jobID === id);
        if (task) task.status = newStatus;
      }
    };
  });

  await page.goto(webURL);
});

test('has title', async ({ page }) => {

  
  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Workflow Hub/);
});

test('add workflow', async ({ page }) => {

  const initialCount = await page.locator('.workflow-card').count();
  // test if workflow5 is added
  await page.getByRole('button', { name: 'New workflow' }).click();
  await page.locator('#taskName').fill('new task5');
  await page.locator('#taskDescription').fill('new task5 description');
  await page.getByRole('button', { name: 'Add workflow' }).click()
  
  await page.waitForTimeout(2000); 
  
  await expect(page.getByText('new task5')).toBeVisible();
  await expect(page.locator('.workflow-card')).toHaveCount(initialCount + 1);
});

test('delete workflow', async ({ page }) => {
  const cardLocator = page.locator('.workflow-card');
  await cardLocator.first().waitFor();
  const initialCount = await cardLocator.count();


  const testCard = cardLocator.first(); 
  await testCard.locator('.delete-clicked').click();
  

  await page.locator('#deleteConfirm').click();

  await expect(cardLocator).toHaveCount(initialCount - 1);
});

test('status changed', async ({ page }) => {
const testCard = page.locator('.workflow-card').first();
  await testCard.waitFor();


  const isInitiallyActive = await testCard.evaluate(el => el.classList.contains('status-active'));
  
  
  await testCard.locator('#status').click();

  if (isInitiallyActive) {
    await expect(testCard).toHaveClass(/status-inactive/);
  } else {
    await expect(testCard).toHaveClass(/status-active/);
  }
});


