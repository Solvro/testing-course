import { Page, expect } from '@playwright/test';

export class TestHelpers {
  constructor(private page: Page) { }

  /**
   * Authenticate user and navigate to plans page
   */
  async authenticateUser(email: string = 'test@student.pwr.edu.pl', otp: string = '123456') {
    await this.page.goto('/');

    // Fill email
    await this.page.locator('input[type="email"]').fill(email);
    await this.page.locator('button[type="submit"]').click();

    // Wait for OTP step
    await expect(this.page.locator('[data-input-otp]')).toBeVisible();

    // Fill OTP
    const otpInputs = this.page.locator('[data-input-otp] input');
    for (let i = 0; i < otp.length; i++) {
      await otpInputs.nth(i).fill(otp[i]);
    }

    // Submit OTP
    await this.page.locator('button:has-text("Zweryfikuj")').click();

    // Verify we're on plans page
    await expect(this.page).toHaveURL('/plans');
  }

  /**
   * Simulate already authenticated state using localStorage
   */
  async setAuthenticatedState(email: string = 'test@student.pwr.edu.pl') {
    await this.page.addInitScript((userEmail) => {
      localStorage.setItem('auth-token', 'mock-token');
      localStorage.setItem('user-email', userEmail);
    }, email);
  }

  /**
   * Clear authentication state
   */
  async clearAuthState() {
    await this.page.evaluate(() => {
      localStorage.removeItem('auth-token');
      localStorage.removeItem('user-email');
    });
  }

  /**
   * Wait for loading to complete
   */
  async waitForLoadingToComplete() {
    // Wait for any loading spinners to disappear
    await this.page.waitForSelector('svg.lucide-loader-2', { state: 'hidden' });
  }

  /**
   * Check if element is visible with timeout
   */
  async expectElementVisible(selector: string, timeout: number = 5000) {
    await expect(this.page.locator(selector)).toBeVisible({ timeout });
  }

  /**
   * Fill OTP inputs with given code
   */
  async fillOtpInputs(code: string) {
    const otpInputs = this.page.locator('[data-input-otp] input');
    for (let i = 0; i < code.length; i++) {
      await otpInputs.nth(i).fill(code[i]);
    }
  }

  /**
   * Verify common page elements
   */
  async verifyLoginPageElements() {
    await expect(this.page.locator('h1')).toContainText('Zaloguj się do planera');
    await expect(this.page.locator('img[alt="Solvro Logo"]')).toBeVisible();
    await expect(this.page.locator('input[type="email"]')).toBeVisible();
    await expect(this.page.locator('button[type="submit"]')).toBeVisible();
  }

  /**
   * Verify plans page elements
   */
  async verifyPlansPageElements() {
    await expect(this.page.locator('h1')).toContainText('Planer - kocham planer');
    await expect(this.page.locator('button:has-text("Wyloguj")')).toBeVisible();
    await expect(this.page.locator('.grid')).toBeVisible();
  }

  /**
   * Test responsive behavior
   */
  async testMobileViewport() {
    await this.page.setViewportSize({ width: 375, height: 667 });
  }

  async testTabletViewport() {
    await this.page.setViewportSize({ width: 768, height: 1024 });
  }

  async testDesktopViewport() {
    await this.page.setViewportSize({ width: 1200, height: 800 });
  }
}

/**
 * Common test data
 */
export const testData = {
  validEmails: [
    'test@student.pwr.edu.pl',
    'student@student.pwr.edu.pl',
    'john.doe@student.pwr.edu.pl',
    'user123@student.pwr.edu.pl'
  ],
  invalidEmails: [
    'test@gmail.com',
    'test@yahoo.com',
    'test@student.pwr.pl',
    'invalid-email',
    '@student.pwr.edu.pl',
    'test@',
    ''
  ],
  validOtpCodes: [
    '123456',
    '000000',
    '999999'
  ],
  invalidOtpCodes: [
    '12345',   // too short
    '1234567', // too long
    'abcdef',  // non-numeric
    ''         // empty
  ]
};

/**
 * Custom matchers for common assertions
 */
export const customMatchers = {
  async toHaveValidationError(page: Page, errorText: string) {
    await expect(page.locator(`text=${errorText}`)).toBeVisible();
  },

  async toShowLoadingState(page: Page) {
    await expect(page.locator('svg.lucide-loader-2')).toBeVisible();
  },

  async toHidePlanCards(page: Page, count: number) {
    const planCards = page.locator('div.bg-white.dark\\:bg-gray-800.rounded-lg');
    await expect(planCards).toHaveCount(count);
  }
};
