import { screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";

const user = userEvent.setup();

export async function enterEmail(email: string) {
  const emailInput = screen.getByLabelText("Adres e-mail");
  await user.type(emailInput, email);
}

export async function enterOtp(otp: string) {
  const inputOtp = screen.getByRole("textbox");
  await user.type(inputOtp, otp);
}

export async function clickLoginButton() {
  const loginButton = screen.getByRole("button");
  await user.click(loginButton);
}
