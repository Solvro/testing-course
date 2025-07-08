import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { LoginPage } from "@/pages/login";
import { Providers } from "@/components/providers";
import { userEvent } from "@testing-library/user-event";
import {
  MOCK_EMAIL,
  MOCK_EMAIL_INVALID,
  MOCK_EMAIL_WRONG_DOMAIN,
  MOCK_OTP,
  MOCK_OTP_INVALID,
  MOCK_OTP_NO_NUMBERS,
} from "@/tests/utils/constants";

function renderComponent() {
  render(<LoginPage />, {
    wrapper: Providers,
  });
  const user = userEvent.setup();

  return {
    enterEmail: async (email: string) => {
      const emailInput = screen.getByLabelText(/e-mail/i);
      await user.type(emailInput, email);
    },
    clickLoginButton: async () => {
      const loginButton = screen.getByRole("button");
      await user.click(loginButton);
    },
    enterOtp: async (otp: string) => {
      const inputOtp = screen.getByRole("textbox");
      await user.type(inputOtp, otp);
    },
  };
}

describe("Login Page", () => {
  it("should validate invalid email", async () => {
    const { enterEmail, clickLoginButton } = renderComponent();

    await enterEmail(MOCK_EMAIL_INVALID);
    await clickLoginButton();

    expect(screen.getByText(/podaj poprawny/i)).toBeInTheDocument();
  });

  it("should validate email with wrong domain", async () => {
    const { enterEmail, clickLoginButton } = renderComponent();

    await enterEmail(MOCK_EMAIL_WRONG_DOMAIN);
    await clickLoginButton();

    // using "@student.pwr.edu.pl" as it should be results in window is not defined error
    expect(screen.getByText(/@student.pwr.edu.pl/i)).toBeInTheDocument();
  });

  it("should navigate to otp after typing valid email", async () => {
    const { enterEmail, clickLoginButton } = renderComponent();

    await enterEmail(MOCK_EMAIL);
    await clickLoginButton();

    expect(screen.getByText(/hasło/i)).toBeInTheDocument();
  });

  it("should display success toast message when valid OTP", async () => {
    const { enterEmail, clickLoginButton, enterOtp } = renderComponent();
    await enterEmail(MOCK_EMAIL);
    await clickLoginButton();

    await enterOtp(MOCK_OTP);
    await clickLoginButton();

    expect(screen.getByText(/zalogowano pomyślnie/i)).toBeInTheDocument();
  });

  it("should display failure toast message when invalid OTP", async () => {
    const { enterEmail, clickLoginButton, enterOtp } = renderComponent();
    await enterEmail(MOCK_EMAIL);
    await clickLoginButton();

    await enterOtp(MOCK_OTP_INVALID);
    await clickLoginButton();

    expect(screen.getByText(/invalid otp/i)).toBeInTheDocument();
  });

  it("should display failure error message when invalid OTP (not using numbers)", async () => {
    const { enterEmail, clickLoginButton, enterOtp } = renderComponent();
    await enterEmail(MOCK_EMAIL);
    await clickLoginButton();

    await enterOtp(MOCK_OTP_NO_NUMBERS);
    await clickLoginButton();

    expect(screen.getByText(/tylko cyfry/i)).toBeInTheDocument();
  });
});
