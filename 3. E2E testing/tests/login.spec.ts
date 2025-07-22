import { test, expect, Page } from '@playwright/test';
import { faker } from '@faker-js/faker';

const generateValidEmail = (): string => {
  const firstName = faker.person.firstName().toLowerCase();
  const lastName = faker.person.lastName().toLowerCase();
  const digits = faker.number.int({ min: 100, max: 999 });
  return `${firstName}.${lastName}${digits}@student.pwr.edu.pl`;
};
const VALID_EMAIL = generateValidEmail();
const INVALID_EMAIL_FORMAT = 'kreatywnymail123';
const INVALID_EMAIL_DOMAIN = 'student-debil@poczta.z.dupy';
const EMPTY_EMAIL = '';
const INVALID_OTP = '000000';
const EMPTY_OTP = '';

const EMAIL_INPUT_REGEX = /e.mail/i;
const NEXT_BUTTON_REGEX = /kod/i;
const OTP_INPUT_REGEX = /hasło/i;
const LOGIN_BUTTON_REGEX = /zaloguj/i;
const LOGOUT_BUTTON_REGEX = /wyloguj/i;
const INVALID_EMAIL_ERROR_REGEX = /podaj poprawny adres/i;
const INVALID_DOMAIN_ERROR_REGEX = /musi kończyć się na @student.pwr.edu.pl/i;
const EMPTY_OTP_ERROR_REGEX = /musi mieć 6 znaków/i;
const INVALID_OTP_ERROR_REGEX = /invalid OTP/i;
const LOGIN_SUCCESS_REGEX = /zalogowano pomyślnie/i;
const PLANNER_HEADER_REGEX = /planer - kocham planer/i;
const OTP_CONSOLE_REGEX = /\d{6}/;

const enterEmailAndProceed = async (page: Page, email: string) => {
  const emailInput = page.getByRole('textbox', { name: EMAIL_INPUT_REGEX });
  await emailInput.fill(email);
  const nextButton = page.getByRole('button', { name: NEXT_BUTTON_REGEX });
  await nextButton.click();
};

const enterOtpAndLogin = async (page: Page, otp: string) => {
  const OTPInput = page.getByRole('textbox', { name: OTP_INPUT_REGEX });
  await OTPInput.fill(otp);
  const loginButton = page.getByRole('button', { name: LOGIN_BUTTON_REGEX });
  await loginButton.click();
};

const getOTPFromConsole = (page: Page): Promise<string> => {
  return new Promise<string>((resolve) => {
    page.on('console', (msg) => {
      const match = msg.text().match(OTP_CONSOLE_REGEX);
      if (match) {
        resolve(match[0]);
      }
    });
  });
};

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login form', async ({ page }) => {
    const emailInput = page.getByRole('textbox', { name: EMAIL_INPUT_REGEX });
    await expect(emailInput).toBeVisible();

    const nextButton = page.getByRole('button', { name: NEXT_BUTTON_REGEX });
    await expect(nextButton).toBeVisible();
  });

  test('should not allow user to enter empty email', async ({ page }) => {
    await enterEmailAndProceed(page, EMPTY_EMAIL);

    const errorMessage = page.getByText(INVALID_EMAIL_ERROR_REGEX);
    await expect(errorMessage).toBeVisible();
  });

  test('should not allow user to enter invalid email', async ({ page }) => {
    await enterEmailAndProceed(page, INVALID_EMAIL_FORMAT);

    const errorMessage = page.getByText(INVALID_EMAIL_ERROR_REGEX);
    await expect(errorMessage).toBeVisible();
  });

  test('should not allow user to enter email with invalid domain', async ({ page }) => {
    await enterEmailAndProceed(page, INVALID_EMAIL_DOMAIN);

    const errorMessage = page.getByText(INVALID_DOMAIN_ERROR_REGEX);
    await expect(errorMessage).toBeVisible();
  });

  test('should allow user to enter valid email and proceed', async ({ page }) => {
    await enterEmailAndProceed(page, VALID_EMAIL);

    const OTPInput = page.getByRole('textbox', { name: OTP_INPUT_REGEX });
    await expect(OTPInput).toBeVisible();

    const loginButton = page.getByRole('button', { name: LOGIN_BUTTON_REGEX });
    await expect(loginButton).toBeVisible();
  });

  test('should not allow user to enter empty OTP', async ({ page }) => {
    await enterEmailAndProceed(page, VALID_EMAIL);
    await enterOtpAndLogin(page, EMPTY_OTP);

    const errorMessage = page.getByText(EMPTY_OTP_ERROR_REGEX);
    await expect(errorMessage).toBeVisible();
  });

  test('should fail login with invalid OTP', async ({ page }) => {
    await enterEmailAndProceed(page, VALID_EMAIL);
    await enterOtpAndLogin(page, INVALID_OTP); // API only generates OTPs in range 100000-999999

    const errorMessage = page.getByText(INVALID_OTP_ERROR_REGEX);
    await expect(errorMessage).toBeVisible();
  });

  test('should allow user to login with valid OTP', async ({ page }) => {
    const otpPromise = getOTPFromConsole(page);
    await enterEmailAndProceed(page, VALID_EMAIL);
    const otp = await otpPromise;
    await enterOtpAndLogin(page, otp);

    const successMessage = page.getByText(LOGIN_SUCCESS_REGEX);
    await expect(successMessage).toBeVisible();

    const planerHeader = page.getByRole('heading', { name: PLANNER_HEADER_REGEX });
    await expect(planerHeader).toBeVisible();
  });

  test('user should be able to logout', async ({ page }) => {
    const otpPromise = getOTPFromConsole(page);
    await enterEmailAndProceed(page, VALID_EMAIL);
    const otp = await otpPromise;
    await enterOtpAndLogin(page, otp);

    const logoutButton = page.getByRole('button', { name: LOGOUT_BUTTON_REGEX });
    await logoutButton.click();

    const successMessage = page.getByText(LOGIN_SUCCESS_REGEX);
    await expect(successMessage).not.toBeVisible();
  });
});