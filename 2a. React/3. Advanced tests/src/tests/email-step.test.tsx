import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EmailStep } from "@/components/email-step";
import { Providers } from "@/components/providers";

describe("Email step component", () => {

  const renderEmailStep = () => {
    return render(
      <EmailStep setStep={ vi.fn()} setEmail={vi.fn()} />,
      { wrapper: Providers }
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render email form correctly", () => {
    renderEmailStep();

    expect(screen.getByLabelText("Adres e-mail")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("123456@student.pwr.edu.pl")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /wyślij kod/i })).toBeInTheDocument();
  });

  it("should show validation error when invalid email is entered", async () => {
    const user = userEvent.setup();
    renderEmailStep();

    const emailInput = screen.getByLabelText("Adres e-mail");
    const submitButton = screen.getByRole("button", { name: /wyślij kod/i });

    // invalid email format
    await user.clear(emailInput);
    await user.type(emailInput, "invalid-email");
    await user.click(submitButton);
    expect(await screen.findByText(/Podaj poprawny adres email/i)).toBeInTheDocument();

    // invalid email domain
    await user.clear(emailInput);
    await user.type(emailInput, "invalid@aaa.pl");
    await user.click(submitButton);
    expect(await screen.findByText(/email musi kończyć się na/i)).toBeInTheDocument();
  });

  it("should submit valid email and proceed to OTP step", async () => {
    const user = userEvent.setup();
    renderEmailStep();

    const emailInput = screen.getByLabelText("Adres e-mail");
    const submitButton = screen.getByRole("button", { name: /wyślij kod/i });

    await user.type(emailInput, "test@student.pwr.edu.pl");
    await user.click(submitButton);
  });

  it("should clear validation errors when user types new valid email", async () => {
    const user = userEvent.setup();
    renderEmailStep();

    const emailInput = screen.getByLabelText("Adres e-mail");
    const submitButton = screen.getByRole("button", { name: /wyślij kod/i });

    await user.type(emailInput, "invalid");
    await user.click(submitButton);
    expect(await screen.findByText("Podaj poprawny adres email")).toBeInTheDocument();

    await user.clear(emailInput);
    await user.type(emailInput, "valid@student.pwr.edu.pl");

    await waitFor(() => {
      expect(screen.queryByText("Podaj poprawny adres email")).not.toBeInTheDocument();
    });
  });
});
