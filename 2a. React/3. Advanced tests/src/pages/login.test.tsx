import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { LoginPage } from "@/pages/login";
import { Providers } from "@/components/providers";
import { userEvent } from "@testing-library/user-event";
import {
  MOCK_EMAIL,
  MOCK_INVALID_FORMAT_OTP,
  MOCK_VALID_OTP,
} from "@/tests/mocks/consts";
import { mockAuthState } from "@/tests/mocks/auth";
import { beforeEach } from "node:test";

const testSetup = () => {
  const screen = render(<LoginPage />, {
    wrapper: Providers,
  });
  const user = userEvent.setup();

  const emailInput = screen.getByLabelText(/e-mail/i);
  const submitButton = screen.getByRole("button");

  return { screen, user, emailInput, submitButton };
};

describe("Login Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthState(false);
  });

  it("should display an error message for invalid email", async () => {
    const { screen, user, emailInput, submitButton } = testSetup();

    await user.type(emailInput, "invalid-email");
    await user.click(submitButton);

    expect(screen.getByText(/podaj poprawny/i)).toBeInTheDocument();
  });

  it("should validate email domain", async () => {
    const { screen, user, emailInput, submitButton } = testSetup();

    await user.type(emailInput, "invalid-email@solvro.pl");
    await user.click(submitButton);

    expect(screen.getByText(/@student.pwr.edu.pl/i)).toBeInTheDocument();
  });

  it("should render OTP input after valid email", async () => {
    const { screen, user, emailInput, submitButton } = testSetup();

    await user.type(emailInput, MOCK_EMAIL);
    await user.click(submitButton);

    expect(screen.queryByText(/podaj poprawny/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/hasło jednorazowe/i)).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("should display error for invalid format of OTP", async () => {
    mockAuthState(false);
    const { screen, user, emailInput, submitButton } = testSetup();

    await user.type(emailInput, MOCK_EMAIL);
    await user.click(submitButton);

    const otpInput = screen.getByLabelText(/hasło jednorazowe/i);
    await user.type(otpInput, MOCK_INVALID_FORMAT_OTP);

    const loginButton = screen.getByRole("button");
    await user.click(loginButton);

    expect(screen.getByText(/musi mieć 6 znaków/i)).toBeInTheDocument();
  });

  it("should not display error for valid OTP", async () => {
    mockAuthState(false);
    const { screen, user, emailInput, submitButton } = testSetup();

    await user.type(emailInput, MOCK_EMAIL);
    await user.click(submitButton);

    const otpInput = screen.getByLabelText(/hasło jednorazowe/i);
    await user.type(otpInput, MOCK_VALID_OTP);

    const loginButton = screen.getByRole("button");
    await user.click(loginButton);

    expect(screen.queryByText(/musi mieć 6 znaków/i)).not.toBeInTheDocument();
  });
});
