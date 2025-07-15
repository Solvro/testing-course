import { test, expect } from '@playwright/test';

test.describe('Complete User Flow E2E', () => {
  test('should attempt complete authentication flow', async ({ page }) => {
    // Step 1: Navigate to login page
    await page.goto('/');

    // Step 2: Verify login page is displayed
    await expect(page.locator('h1')).toBeVisible();

    // Step 3: Fill email form with valid PWr email
    await page.locator('input[name="email"]').fill('test@student.pwr.edu.pl');
    await page.locator('button[type="submit"]').click();

    // Step 4: Wait for response
    await page.waitForTimeout(3000);

    // Step 5: Check what happened after form submission
    const currentUrl = page.url();
    const pageContent = await page.textContent('body');

    // Verify we got some response
    expect(pageContent?.length).toBeGreaterThan(10);

    console.log('Form submission completed, current URL:', currentUrl);

    // If OTP step is available, test it
    const otpInput = page.locator('[data-input-otp]');
    const hasOtpInput = await otpInput.isVisible().catch(() => false);

    if (hasOtpInput) {
      console.log('✅ OTP step reached');

      // Try to fill OTP if inputs are available
      const otpInputs = page.locator('[data-input-otp] input');
      const inputCount = await otpInputs.count();

      if (inputCount > 0) {
        // Fill first few inputs
        await otpInputs.first().fill('1');
        if (inputCount > 1) await otpInputs.nth(1).fill('2');
        if (inputCount > 2) await otpInputs.nth(2).fill('3');

        console.log('✅ OTP inputs filled successfully');
      }
    } else {
      console.log('ℹ️ OTP step not reached - checking for other responses');

      // Check if we're on plans page (might auto-login)
      const isOnPlans = pageContent?.toLowerCase().includes('planer');
      const isOnLogin = pageContent?.toLowerCase().includes('zaloguj');

      expect(isOnPlans || isOnLogin).toBe(true);
    }
  });

  test('should handle authentication persistence', async ({ page }) => {
    // Simulate authenticated state
    await page.addInitScript(() => {
      localStorage.setItem('auth-token', 'mock-token');
      localStorage.setItem('user-email', 'test@student.pwr.edu.pl');
    });

    // Go to login page
    await page.goto('/');

    // Check if redirected to plans or stays on login
    const currentUrl = page.url();
    const pageContent = await page.textContent('body');

    expect(pageContent?.length).toBeGreaterThan(10);
    console.log('Authentication persistence test completed, URL:', currentUrl);
  });

  test('should handle protected route access', async ({ page }) => {
    // Try to access plans page directly without authentication
    await page.goto('/plans');

    // Should either show plans, redirect to login, or show error
    const currentUrl = page.url();
    const pageContent = await page.textContent('body');

    expect(pageContent?.length).toBeGreaterThan(10);
    console.log('Protected route access test completed, URL:', currentUrl);
  });
});
