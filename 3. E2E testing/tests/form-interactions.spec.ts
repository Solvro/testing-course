import { test, expect } from '@playwright/test';

test.describe('Form Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should fill and clear email input', async ({ page }) => {
    const emailInput = page.locator('input[name="email"]');

    // Type in email
    await emailInput.fill('user@student.pwr.edu.pl');
    await expect(emailInput).toHaveValue('user@student.pwr.edu.pl');

    // Clear email
    await emailInput.clear();
    await expect(emailInput).toHaveValue('');

    // Type different email
    await emailInput.fill('another@student.pwr.edu.pl');
    await expect(emailInput).toHaveValue('another@student.pwr.edu.pl');
  });

  test('should handle keyboard navigation', async ({ page }) => {
    const emailInput = page.locator('input[name="email"]');
    const submitButton = page.locator('button[type="submit"]');

    // Focus email input
    await emailInput.focus();
    await expect(emailInput).toBeFocused();

    // Tab to submit button
    await page.keyboard.press('Tab');
    await expect(submitButton).toBeFocused();

    // Go back to email with Shift+Tab
    await page.keyboard.press('Shift+Tab');
    await expect(emailInput).toBeFocused();
  });

  test('should handle copy and paste', async ({ page }) => {
    const emailInput = page.locator('input[name="email"]');

    const testEmail = 'test@student.pwr.edu.pl';

    // Fill email
    await emailInput.fill(testEmail);

    // Select all text and copy
    await emailInput.selectText();
    await page.keyboard.press('ControlOrMeta+c');

    // Clear and paste
    await emailInput.clear();
    await page.keyboard.press('ControlOrMeta+v');

    // Should have the same value
    await expect(emailInput).toHaveValue(testEmail);
  });

  test('should prevent submission with invalid email format', async ({ page }) => {
    const emailInput = page.locator('input[name="email"]');
    const submitButton = page.locator('button[type="submit"]');

    // Try invalid email format
    await emailInput.fill('not-an-email');
    await submitButton.click();

    // Should still be on the same page (form validation prevents submission)
    await expect(page.locator('h1')).toContainText('Zaloguj się do planera');

    // Email input should still be visible
    await expect(emailInput).toBeVisible();
  });

  test('should show visual feedback on form interaction', async ({ page }) => {
    const emailInput = page.locator('input[name="email"]');

    // Check initial state
    await expect(emailInput).toBeVisible();

    // Focus input - should show some visual change
    await emailInput.focus();

    // Type in input
    await emailInput.fill('test@student.pwr.edu.pl');

    // Input should contain the typed value
    await expect(emailInput).toHaveValue('test@student.pwr.edu.pl');

    // Blur input
    await emailInput.blur();

    // Value should persist
    await expect(emailInput).toHaveValue('test@student.pwr.edu.pl');
  });
});
