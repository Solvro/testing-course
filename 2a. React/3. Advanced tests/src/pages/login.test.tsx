import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import {
  mockAuth,
  setupLoginPage,
  getEmailElements,
  submitEmail,
  setupOtpStep,
  submitOtp,
  getOtpElements,
} from "@/tests/utils/login";

const mockNavigate = vi.fn();
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("Login Page Routing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should navigate to /plans when user is authenticated", () => {
    mockAuth({ isAuthenticated: true, user: { email: "test@example.com" } });
    const { router } = setupLoginPage();

    expect(router.state.location.pathname).toBe("/plans");
  });

  it("should stay on login page when user is not authenticated", () => {
    mockAuth();
    const { router } = setupLoginPage();

    expect(router.state.location.pathname).toBe("/");
    expect(screen.getByText(/Zaloguj/)).toBeInTheDocument();
  });
});

describe("Email Step Validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should have email input field", () => {
    mockAuth();
    setupLoginPage();
    const { emailInput } = getEmailElements();
    
    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveAttribute("placeholder");
  });

  it("should show error for invalid email format", async () => {
    await submitEmail("invalid-email");

    await waitFor(() => {
      expect(screen.getByText(/Podaj poprawny adres/i)).toBeInTheDocument();
    });
  });

  it("should show error for email not ending with @student.pwr.edu.pl", async () => {
    await submitEmail("test@gmail.com");

    await waitFor(() => {
      expect(screen.getByText(/kończyć się na @student.pwr.edu.pl/i)).toBeInTheDocument();
    });
  });

  it("should proceed to OTP step with valid email", async () => {
    await submitEmail("123456@student.pwr.edu.pl");

    await waitFor(() => {
      expect(screen.getByText("Hasło jednorazowe")).toBeInTheDocument();
    });
  });
});

describe("OTP Step Validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should have OTP input fields", async () => {
    await setupOtpStep();

    const otpInputs = screen.getAllByRole("textbox");
    expect(otpInputs).toHaveLength(1);
  });

  it("should show error for invalid OTP length", async () => {
    await submitOtp("123");

    await waitFor(() => {
      expect(screen.getByText("Kod OTP musi mieć 6 znaków")).toBeInTheDocument();
    });
  });

  it("should show error for non-numeric OTP", async () => {
    await submitOtp("abcdef");

    await waitFor(() => {
      expect(screen.getByText("Kod OTP może zawierać tylko cyfry")).toBeInTheDocument();
    });
  });

  it("should redirect to plans page when OTP is correct", async () => {
    const mockLogin = vi.fn();
    mockAuth({ login: mockLogin });
    
    const { user } = setupLoginPage();
    
    const { emailInput, submitButton } = getEmailElements();
    await user.type(emailInput, "123456@student.pwr.edu.pl");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Hasło jednorazowe")).toBeInTheDocument();
    });

    const { otpInput, loginButton } = getOtpElements();
    await user.type(otpInput, "123456");
    await user.click(loginButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("123456@student.pwr.edu.pl");
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/plans");
    });
  });
});