import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { LoginPage } from "@/pages/login";
import { Providers } from "@/components/providers";
import { userEvent } from "@testing-library/user-event";
import {
  MOCK_EMAIL,
  MOCK_OTP,
  MOCK_OTP_INVALID,
} from "@/tests/mocks/constants";

describe("Login Page", () => {
  function renderComponent() {
    render(<LoginPage />, {
      wrapper: Providers,
    });
    const user = userEvent.setup();

    return {
      user,
      enterEmail: async (email: string) => {
        const emailInput = screen.getByLabelText("Adres e-mail");
        await user.type(emailInput, email);
      },
      enterOtp: async (otp: string) => {
        const inputOtp = screen.getByRole("textbox");
        await user.type(inputOtp, otp);
      },
      clickSubmitButton: async () => {
        const button = screen.getByRole("button");
        await user.click(button);
      },
    };
  }

  it("should validate an email", async () => {
    const { enterEmail, clickSubmitButton } = renderComponent();

    await enterEmail("invalid-email");
    await clickSubmitButton();

    expect(screen.getByText(/poprawny/i)).toBeInTheDocument();
  });

  it("should navigate to otp step when passing correct email", async () => {
    const { enterEmail, clickSubmitButton } = renderComponent();

    await enterEmail(MOCK_EMAIL);
    await clickSubmitButton();

    expect(screen.getByText(/hasło/i)).toBeInTheDocument();
  });

  it("should display toast with success message when typing correct OTP", async () => {
    const { enterEmail, clickSubmitButton, enterOtp } = renderComponent();
    await enterEmail(MOCK_EMAIL);
    await clickSubmitButton();

    await enterOtp(MOCK_OTP);
    await clickSubmitButton();

    expect(screen.getByText(/zalogowano pomyślnie/i)).toBeInTheDocument();
  });

  it("should display toast with failure message when typing incorrect OTP", async () => {
    const { enterEmail, clickSubmitButton, enterOtp } = renderComponent();
    await enterEmail(MOCK_EMAIL);
    await clickSubmitButton();

    await enterOtp(MOCK_OTP_INVALID);
    await clickSubmitButton();

    expect(screen.getByText(/invalid/i)).toBeInTheDocument();
  });
});
