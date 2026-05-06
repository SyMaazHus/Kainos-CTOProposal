// @ts-check
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://127.0.0.1:3000/src/setting.html');
});

test('has title', async ({ page }) => {
  await page.goto('http://127.0.0.1:3000/src/setting.html');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Setting/);
});

test('can edit display name', async ({ page }) => {
  const displayName = page.locator('.setting-input');
  await displayName.fill('new name');
  await expect(displayName).toHaveValue('new name');
});

test('can edit email', async ({ page }) => {
  const emailInput = page.locator('.info-input').first();
  await emailInput.fill('abc@example.com');
  await expect(emailInput).toHaveValue('abc@example.com');

});

test('toggle notification', async ({ page }) => {
  const toggle = page.locator('.slider');
  await toggle.click(); 
  await expect(toggle).toBeChecked();
});

test('avatar visible', async ({ page }) => {
  await expect(page.locator('#avatar-circle')).toBeVisible();
});

test('upload avatar', async ({ page }) => {
  await page.setInputFiles('#avatar-input', '/Users/apple/Desktop/SoftEng/UI/team21_project/tests/assets/avatar_test.JPG');
});

test('visible texts', async ({ page }) => {
  await expect(page.getByText('LANGUAGE')).toBeVisible();
  await expect(page.getByText('More Info')).toBeVisible();
  await expect(page.getByText('Manage Integration')).toBeVisible();

  
});
