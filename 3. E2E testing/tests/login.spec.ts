import { test, expect } from '@playwright/test'

declare global {
  interface Window {
    otpCode: string | null
  }
}

test('should login with the otp code', async ({ page }) => {
  await page.evaluate(() => {
    window.otpCode = null
  })

  page.on('console', msg => {
    const text = msg.text()
    const match = text.match(/Kod OTP to (\d{6})/)
    if (match) {
      page.evaluate(otp => {
        window.otpCode = otp
      }, match[1])
    }
  })

  await page.goto('http://localhost:5173')
  await page.getByPlaceholder('123456@student.pwr.edu.pl').fill('272411@student.pwr.edu.pl')
  await page.getByRole('button', { name: 'Wyślij kod' }).click()
  await expect(page.getByText('Hasło jednorazowe')).toBeVisible()
  await page.waitForFunction(() => window.otpCode !== null)
  const otpCode = await page.evaluate(() => window.otpCode)
  if (!otpCode) {
    throw new Error('nie udało się przechwycić kodu OTP z konsoli (giga szkoda)')
  }
  for (let i = 0; i < 6; i++) {
    await page.getByRole('textbox').nth(i).fill(otpCode[i])
  }
  await page.getByRole('button', { name: 'Zaloguj się' }).click()
  await expect(page).toHaveURL(/.*\/plans/)
})
