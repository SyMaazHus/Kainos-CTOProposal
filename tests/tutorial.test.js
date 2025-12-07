import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto('http://127.0.0.1:5500/src/tutorial.html');
});


test("tutorial next button works", async ({ page }) => {
  const tooltip = page.locator("#tutorialTooltip .tooltip-text");
  await expect(tooltip).toBeVisible();

  const firstText = await tooltip.textContent();

  await page.click(".tooltip-next");

  await expect(tooltip).toBeVisible();
  const secondText = await tooltip.textContent();

  expect(secondText).not.toBe(firstText);
});
