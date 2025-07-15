import { test, expect } from '@playwright/test';

test.describe('Basic Setup Test', () => {
  test('should be able to access the application', async ({ page }) => {
    // Start the dev server manually first
    await page.goto('http://localhost:5173/');

    // Check if the page loads (might fail if dev server isn't running)
    // This is just to verify Playwright setup works
    await expect(page).toHaveTitle("Solvro Testing Course 🥰");
  });

  test('simple assertion test', async ({ page }) => {
    // Basic test that doesn't require the server
    await page.goto('data:text/html,<html><head><title>Test</title></head><body><h1>Hello World</h1></body></html>');
    await expect(page.locator('h1')).toContainText('Hello World');
  });
});
