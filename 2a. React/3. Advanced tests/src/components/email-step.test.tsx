import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EmailStep } from "@/components/email-step";
import { HttpResponse, delay, http } from "msw";
import { server } from "@/tests/mocks/server";
import { BASE_URL } from "@/api/base-url";
import { toast } from "sonner";

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

const setup = () => {
  const user = userEvent.setup();

  const mockSetStep = vi.fn();
  const mockSetEmail = vi.fn();

  const typeEmail = async (email: string) => {
    await user.type(screen.getByLabelText(/e-mail/i), email);
  };

  const submitEmail = async () => {
    await user.click(screen.getByRole("button", { name: /wyślij kod/i }));
  };

  render(<EmailStep setStep={mockSetStep} setEmail={mockSetEmail} />);

  return {
    mockSetStep,
    mockSetEmail,
    typeEmail,
    submitEmail,
  };
};

describe("EmailStep", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the email form", () => {
    setup();

    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/student.pwr.edu.pl/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Wyślij kod" })
    ).toBeInTheDocument();
  });

  it("should show error for invalid email format", async () => {
    const { typeEmail, submitEmail } = setup();

    await typeEmail("invalid-email");
    await submitEmail();

    expect(
      await screen.findByText(/podaj poprawny adres email/i)
    ).toBeInTheDocument();
  });

  it("should show error for non-PWR email", async () => {
    const { typeEmail, submitEmail } = setup();

    await typeEmail("test@gmail.com");
    await submitEmail();

    expect(await screen.findByText(/@student.pwr.edu.pl/i)).toBeInTheDocument();
  });

  it("should submit valid PWR email and proceed to OTP step", async () => {
    const { typeEmail, submitEmail, mockSetEmail, mockSetStep } = setup();

    await typeEmail("test@student.pwr.edu.pl");
    await submitEmail();

    await waitFor(() => {
      expect(mockSetEmail).toHaveBeenCalledWith("test@student.pwr.edu.pl");
      expect(mockSetStep).toHaveBeenCalledWith("otp");
    });
  });

  it("should show loading state during submission", async () => {
    server.use(
      http.post(`${BASE_URL}/user/otp/get`, async ({ request }) => {
        const { email } = (await request.json()) as { email: string };

        await delay(100);
        if (email === "error@student.pwr.edu.pl") {
          return HttpResponse.json({ success: false }, { status: 500 });
        }

        return HttpResponse.json({
          success: true,
          otp: "123456",
        });
      })
    );
    const { typeEmail, submitEmail } = setup();

    await typeEmail("test@student.pwr.edu.pl");
    await submitEmail();

    expect(screen.getByRole("button", { name: /wyślij kod/i })).toHaveAttribute(
      "disabled"
    );
  });

  it("should show error toast when API request fails", async () => {
    server.use(
      http.post(`${BASE_URL}/user/otp/get`, () => {
        return HttpResponse.json({ success: false }, { status: 500 });
      })
    );
    const { typeEmail, submitEmail } = setup();

    await typeEmail("test@student.pwr.edu.pl");
    await submitEmail();

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(expect.stringMatching(/błąd/i));
    });
  });

  it("should log OTP code when API request succeeds", async () => {
    const consoleSpy = vi.spyOn(console, "info");
    const { typeEmail, submitEmail } = setup();

    await typeEmail("test@student.pwr.edu.pl");
    await submitEmail();

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringMatching(/123456/i));
    });

    consoleSpy.mockRestore();
  });
});
