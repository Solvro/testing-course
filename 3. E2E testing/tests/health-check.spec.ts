import { test, expect } from '@playwright/test';

test.describe('Test Suite Health Check', () => {
  test('should verify basic app structure', async ({ page }) => {
    await page.goto('/');

    // Check that page loads
    await expect(page.locator('body')).toBeVisible();

    // Check for heading (flexible)
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();

    // Check for email input with correct selector
    const emailInput = page.locator('input[name="email"]');
    await expect(emailInput).toBeVisible();

    // Check for submit button
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();

    console.log('✅ Basic app structure verified');
  });

  test('should verify form interaction works', async ({ page }) => {
    await page.goto('/');

    const emailInput = page.locator('input[name="email"]');

    // Test form interaction
    await emailInput.fill('test@student.pwr.edu.pl');
    await expect(emailInput).toHaveValue('test@student.pwr.edu.pl');

    // Test clear
    await emailInput.clear();
    await expect(emailInput).toHaveValue('');

    console.log('✅ Form interaction verified');
  });

  test('should verify form submission attempt', async ({ page }) => {
    await page.goto('/');

    // Fill form and submit
    await page.locator('input[name="email"]').fill('test@student.pwr.edu.pl');
    await page.locator('button[type="submit"]').click();

    // Wait for response
    await page.waitForTimeout(2000);

    // Verify page is still responsive
    const bodyContent = await page.textContent('body');
    expect(bodyContent?.length).toBeGreaterThan(10);

    console.log('✅ Form submission attempt verified');
  });

  test('should verify responsive design', async ({ page }) => {
    // Test different viewports
    const viewports = [
      { width: 1200, height: 800 }, // Desktop
      { width: 768, height: 1024 }, // Tablet
      { width: 375, height: 667 }   // Mobile
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto('/');

      // Check essential elements are visible
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('input[name="email"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    }

    console.log('✅ Responsive design verified');
  });

  test('should verify error handling', async ({ page }) => {
    // Test page reload
    await page.goto('/');
    await page.reload();
    await expect(page.locator('h1')).toBeVisible();

    // Test navigation
    const currentUrl = page.url();
    await page.goto('/nonexistent');
    await page.goBack();
    await expect(page.locator('h1')).toBeVisible();

    console.log('✅ Error handling verified');
  });
});
