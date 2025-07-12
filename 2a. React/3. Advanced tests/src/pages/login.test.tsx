import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor, cleanup } from "@testing-library/react";
import {
  mockAuth,
  setupLoginPage,
  getEmailElements,
  submitEmail,
  setupOtpStep,
  submitOtp,
} from "@/tests/utils/login";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("Login Page Routing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it("should navigate to /plans when user is authenticated", async () => {
    mockAuth({ isAuthenticated: true, user: { email: "test@example.com" } });
    const { router } = setupLoginPage();

    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/plans");
    }, { timeout: 5000 });
  });

  it("should stay on login page when user is not authenticated", async () => {
    mockAuth({ isAuthenticated: false });
    const { router } = setupLoginPage();

    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/");
    });
    
    await waitFor(() => {
      expect(screen.getByText(/Zaloguj/)).toBeInTheDocument();
    });
  });
});

describe("Email Step Validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it("should have email input field", async () => {
    mockAuth({ isAuthenticated: false });
    setupLoginPage();
    
    await waitFor(() => {
      expect(screen.getByText(/Zaloguj/)).toBeInTheDocument();
    });
    
    await waitFor(() => {
      const { emailInput } = getEmailElements();
      expect(emailInput).toBeInTheDocument();
      expect(emailInput).toHaveAttribute("placeholder");
    });
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
    cleanup();
  });

  it("should have OTP input fields", async () => {
    await setupOtpStep();

    await waitFor(() => {
      const otpInputs = screen.getAllByRole("textbox");
      expect(otpInputs).toHaveLength(1);
    });
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
});