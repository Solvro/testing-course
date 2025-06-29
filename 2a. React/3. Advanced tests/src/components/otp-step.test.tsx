import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { OtpStep } from "./otp-step";
import { Providers } from "./providers";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { server } from "@/tests/mocks/server";
import { http, HttpResponse } from "msw";
import { BASE_URL } from "@/api/base-url";

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
  Toaster: () => null,
}));

const loginMock = vi.fn();

vi.mock("@/hooks/use-auth", () => ({
  useAuth: vi.fn(() => ({
    login: loginMock,
  })),
}));

const navigateMock = vi.fn();

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

// don't ask why, but sometimes those ui components invoke window is not defined error so we mock them here
vi.mock("@/components/ui/input-otp", () => ({
  InputOTP: ({
    children,
    ...props
  }: React.PropsWithChildren<React.InputHTMLAttributes<HTMLInputElement>>) => {
    return (
      <div data-testid="mock-input-otp">
        <input type="text" {...props} />
        {children}
      </div>
    );
  },
  InputOTPGroup: ({ children }: React.PropsWithChildren) => (
    <div>{children}</div>
  ),
  InputOTPSlot: ({ index }: { index: number }) => (
    <span data-testid={`slot-${index}`} />
  ),
}));

const setup = () => {
  const user = userEvent.setup();
  render(<OtpStep email="test@student.pwr.edu.pl" />, { wrapper: Providers });

  const submitButton = screen.getByRole("button", { name: /zaloguj się/i });

  const otpInput = screen.getByRole("textbox");

  const typeOtp = async (otp: string) => {
    await user.type(otpInput, otp);
  };

  const submitOtp = async () => {
    await user.click(submitButton);
  };

  return {
    typeOtp,
    submitOtp,
    submitButton,
    otpInput,
  };
};

describe("OtpStep", () => {
  it("should render", () => {
    const { submitButton, otpInput } = setup();

    expect(screen.getByText(/hasło jednorazowe/i)).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();
    expect(otpInput).toBeInTheDocument();
  });

  it("should give error when otp is less than 6 digits", async () => {
    const { typeOtp, submitOtp } = setup();

    await typeOtp("1234");
    await submitOtp();

    await waitFor(() => {
      expect(screen.getByText(/6 znaków/i)).toBeInTheDocument();
    });
  });

  it("should give error when otp is not digits only", async () => {
    const { typeOtp, submitOtp } = setup();

    await typeOtp("abcdef");
    await submitOtp();

    await waitFor(() => {
      expect(screen.getByText(/tylko cyfry/i)).toBeInTheDocument();
    });
  });

  it("should submit successfully when OTP is correct and navigate to the plans page", async () => {
    const { typeOtp, submitOtp } = setup();

    await typeOtp("123456");
    await submitOtp();

    expect(loginMock).toBeCalledWith("test@student.pwr.edu.pl");
    expect(navigateMock).toBeCalledWith("/plans");
    expect(toast.success).toBeCalled();
  });

  it("should show error on wrong OTP", async () => {
    const { typeOtp, submitOtp } = setup();

    await typeOtp("000000");
    await submitOtp();

    expect(toast.error).toBeCalled();
  });

  it("should show fallback error message if server does not return a message", async () => {
    server.use(
      http.post(`${BASE_URL}/user/otp/verify`, () => {
        return HttpResponse.json({}, { status: 400 });
      })
    );

    const { typeOtp, submitOtp } = setup();

    await typeOtp("000000");
    await submitOtp();

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(expect.stringMatching(/błąd/i));
    });
  });
});
