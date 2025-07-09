import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OtpStep } from "@/components/otp-step";
import { Providers } from "@/components/providers";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";

vi.mock("@/hooks/use-auth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("react-router", () => ({
  useNavigate: vi.fn(),
}));

describe("Otp step component", () => {
  const testEmail = "test@student.pwr.edu.pl";

  beforeEach(() => {
    vi.clearAllMocks();
    
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      login: vi.fn(),   
      logout: vi.fn(),
      isAuthenticated: false,
    });
    
    vi.mocked(useNavigate).mockReturnValue(vi.fn());
  });

  it("should render OTP form correctly", () => {
    render(<OtpStep email={testEmail} />, { wrapper: Providers });

    expect(screen.getByLabelText("Hasło jednorazowe")).toBeInTheDocument();
    expect(screen.getByText("Wpisz kod, który wylądował właśnie na Twoim adresie email")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /zaloguj się/i })).toBeInTheDocument();
    expect(screen.getByLabelText("Hasło jednorazowe")).toBeInTheDocument();
  });

  it("should show validation error for invalid OTP length", async () => {
    const user = userEvent.setup();
    render(<OtpStep email={testEmail} />, { wrapper: Providers });

    const otpInput = screen.getByLabelText("Hasło jednorazowe");
    const submitButton = screen.getByRole("button", { name: /zaloguj się/i });

    await user.type(otpInput, "123");
    await user.click(submitButton);

    expect(await screen.findByText("Kod OTP musi mieć 6 znaków")).toBeInTheDocument();
  });

  it("should show validation error for non-numeric characters", async () => {
    const user = userEvent.setup();
    render(<OtpStep email={testEmail} />, { wrapper: Providers });

    const otpInput = screen.getByLabelText("Hasło jednorazowe");
    const submitButton = screen.getByRole("button", { name: /zaloguj się/i });

    await user.type(otpInput, "abcdef");
    await user.click(submitButton);

    expect(await screen.findByText("Kod OTP może zawierać tylko cyfry")).toBeInTheDocument();
  });

  it("should show loading state while submitting", async () => {
    const user = userEvent.setup();
    render(<OtpStep email={testEmail} />, { wrapper: Providers });

    const otpInput = screen.getByLabelText("Hasło jednorazowe");

    await user.type(otpInput, "123456");
    
    const submitPromise = user.click(screen.getByRole("button", { name: /zaloguj się/i }));

    await waitFor(() => {
      expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    }, { timeout: 100 });

    await submitPromise;
  });
});
