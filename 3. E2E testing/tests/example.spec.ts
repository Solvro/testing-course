import { test, expect, type Page } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:5173');
});

const submitEmail = async (page, text: string) => {
  const emailField =  await page.getByPlaceholder("123456@student.pwr.edu.pl")

  await emailField.fill(text)
  await page.click('button[type="submit"]');
}

test.describe('Checking Email', () => {
  test('should show error if email is invalid', async ({ page }) => {
    await submitEmail(page, 'invalid-email');
    
    await expect(page.getByText('Podaj poprawny adres email')).toBeVisible();
  });

  test('should show error if email does not end with required domain', async ({ page }) => {
    await submitEmail(page, 'nick@gmail.com');
    
    await expect(page.getByText('musi kończyć się na @student.pwr.edu.pl')).toBeVisible();
  });

  test('should not show error for valid email', async ({ page }) => {
    await submitEmail(page, '121212@student.pwr.edu.pl');
    
    await expect(page.getByText('Podaj poprawny adres email')).not.toBeVisible();
    await expect(page.getByText('musi kończyć się na @student.pwr.edu.pl')).not.toBeVisible();
  });
});

test.describe('Checking OTP', () => {
  test.beforeEach(async ({ page }) => {
    await submitEmail(page, '121212@student.pwr.edu.pl');
    await expect(page.getByText('Hasło jednorazowe')).toBeVisible();
  });

  test('should show error if OTP is too short', async ({ page }) => {
    await page.locator('input').fill('12345');
    await page.click('button[type="submit"]');
    
    await expect(page.getByText('Kod OTP musi mieć 6 znaków')).toBeVisible();
  });

  test('should show error if OTP contains non-numeric characters', async ({ page }) => {
    await page.locator('input').fill('abcdef');
    await page.click('button[type="submit"]');
    
    await expect(page.getByText('Kod OTP może zawierać tylko cyfry')).toBeVisible();
  });

  test('should not accept invalid 6-digit OTP', async ({ page }) => {
    let otpCode = '';
    
    page.on('console', (msg) => {
      if (msg.type() === 'info' && msg.text().includes('Kod OTP to')) {
        const match = msg.text().match(/Kod OTP to (\d{6})/);
        if (match) {
          otpCode = match[1];
        }
      }
    });
    
    await page.goto('http://localhost:5173');
    await submitEmail(page, '121212@student.pwr.edu.pl');
    await expect(page.getByText('Hasło jednorazowe')).toBeVisible();
    
    const invalidOtpCode = otpCode.charAt(0) === '1' 
      ? '2' + otpCode.slice(1) 
      : '1' + otpCode.slice(1);

    await page.locator('input').fill(invalidOtpCode);
    await page.click('button[type="submit"]');
    
    await expect(page.getByText('Invalid OTP')).toBeVisible();
  });

  test('should accept valid 6-digit OTP', async ({ page }) => {
    let otpCode = '';
    
    page.on('console', (msg) => {
      if (msg.type() === 'info' && msg.text().includes('Kod OTP to')) {
        const match = msg.text().match(/Kod OTP to (\d{6})/);
        if (match) {
          otpCode = match[1];
        }
      }
    });
    
    await page.goto('http://localhost:5173');
    await submitEmail(page, '121212@student.pwr.edu.pl');
    await expect(page.getByText('Hasło jednorazowe')).toBeVisible();
    
    await page.locator('input').fill(otpCode);
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('http://localhost:5173/plans');
  });
});


