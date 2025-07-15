import { type Page } from "@playwright/test";

export class LoginPage {
  constructor(private page: Page) {}

  private get emailInput() {
    return this.page.getByRole("textbox");
  }
  private get otpInput() {
    return this.page.getByRole("textbox");
  }
  private get sendCodeButton() {
    return this.page.getByRole("button", { name: /wyślij/i });
  }
  private get loginButton() {
    return this.page.getByRole("button", { name: /zaloguj/i });
  }

  async enterEmail(email: string) {
    await this.emailInput.fill(email);
    await this.sendCodeButton.click();
  }

  async enterOtpCode(otpCode: string) {
    await this.otpInput.fill(otpCode);
    await this.loginButton.click();
  }
}
