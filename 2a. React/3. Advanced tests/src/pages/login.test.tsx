import { mockAuth, navigateTo } from "@/tests/utils";
import { screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/components/email-step", () => ({
  EmailStep: ({
    setStep,
    setEmail,
  }: {
    setStep: (step: string) => void;
    setEmail: (email: string) => void;
  }) => (
    <div>
      <label htmlFor="email">Adres e-mail</label>
      <input id="email" type="email" data-testid="email-input" />
      <button
        onClick={() => {
          setStep("otp");
          setEmail("test@pwr.edu.pl");
        }}
        data-testid="submit-email"
      >
        Submit
      </button>
    </div>
  ),
}));

vi.mock("@/components/otp-step", () => ({
  OtpStep: ({ email }: { email: string }) => (
    <div data-testid="otp-step">OTP Step for {email}</div>
  ),
}));

const setup = (isAuthenticated = false) => {
  mockAuth(isAuthenticated);
  navigateTo("/");
};

describe("Login Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the email step by default", () => {
    setup();

    expect(screen.getByText(/zaloguj się/i)).toBeInTheDocument();
    expect(screen.getByText(/podaj swój email/i)).toBeInTheDocument();
    expect(screen.getByTestId("email-input")).toBeInTheDocument();
    expect(screen.getByTestId("submit-email")).toBeInTheDocument();
  });

  it("should redirect to /plans when authenticated", async () => {
    setup(true);

    await waitFor(() => {
      expect(screen.getByText(/kocham planer/i)).toBeInTheDocument();
    });
  });

  it("should switch to OTP step after valid email submission", async () => {
    const user = userEvent.setup();
    setup();

    await user.click(screen.getByTestId("submit-email"));

    await waitFor(() => {
      expect(screen.getByTestId("otp-step")).toBeInTheDocument();
      expect(
        screen.getByText(/OTP Step for test@pwr.edu.pl/)
      ).toBeInTheDocument();
    });
  });
});
