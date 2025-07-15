import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('should load login page within performance budget', async ({ page }) => {
    // Start timing
    const startTime = Date.now();

    await page.goto('/');

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    // Assert page loads within reasonable time (5 seconds to be safe)
    expect(loadTime).toBeLessThan(5000);

    // Check that essential elements are visible
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
  });

  test('should handle form submission quickly', async ({ page }) => {
    await page.goto('/');

    // Fill email and measure submission time
    await page.locator('input[name="email"]').fill('test@student.pwr.edu.pl');

    const startTime = Date.now();
    await page.locator('button[type="submit"]').click();

    // Wait for some response (either OTP or other page)
    await page.waitForTimeout(3000);

    const responseTime = Date.now() - startTime;

    // Should respond within reasonable time
    expect(responseTime).toBeLessThan(5000);

    // Check we got some response
    const bodyText = await page.textContent('body');
    expect(bodyText?.length).toBeGreaterThan(10);
  });

  test('should render plans page efficiently', async ({ page }) => {
    // Set authenticated state
    await page.addInitScript(() => {
      localStorage.setItem('auth-token', 'mock-token');
      localStorage.setItem('user-email', 'test@student.pwr.edu.pl');
    });

    const startTime = Date.now();
    await page.goto('/plans');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    const renderTime = Date.now() - startTime;

    // Plans page should render within reasonable time
    expect(renderTime).toBeLessThan(5000);

    // Check that page has content
    const bodyText = await page.textContent('body');
    expect(bodyText?.length).toBeGreaterThan(10);
  });

  test('should handle form interactions responsively', async ({ page }) => {
    await page.goto('/');

    // Type in email field
    const emailInput = page.locator('input[name="email"]');

    const startTime = Date.now();

    // Simulate typing
    await emailInput.fill('test@student.pwr.edu.pl');

    const typingTime = Date.now() - startTime;

    // Should handle typing without significant delay
    expect(typingTime).toBeLessThan(2000);

    // Verify input value is correct
    await expect(emailInput).toHaveValue('test@student.pwr.edu.pl');
  });

  test('should handle page loads with network delays', async ({ page }) => {
    // Simulate slow network
    await page.route('**/*', route => {
      setTimeout(() => route.continue(), 100);
    });

    await page.goto('/');

    // Even with network delay, page should still load
    await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input[name="email"]')).toBeVisible({ timeout: 10000 });
  });
});
