import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EmailStep } from "@/components/email-step";
import { server } from "@/tests/mocks/server";
import { toast } from "sonner";
import { BASE_URL } from "@/api/base-url";
import { http, HttpResponse } from "msw";

describe("EmailStep", () => {
  const setStep = vi.fn();
  const setEmail = vi.fn();

  beforeEach(() => {
    setStep.mockClear();
    setEmail.mockClear();
    vi.spyOn(toast, "error").mockImplementation(() => "mocked");
  });

  it("waliduje niepoprawny email przed wysłaniem", async () => {
    render(<EmailStep setStep={setStep} setEmail={setEmail} />);
    const user = userEvent.setup();
    const input = screen.getByLabelText(/Adres e-mail/i);
    const btn = screen.getByRole("button", { name: /Wyślij kod/i });

    await user.type(input, "zly@email.pl");
    await user.click(btn);

    expect(
      await screen.findByText(/Adres email musi kończyć się na/)
    ).toBeInTheDocument();
  });

  it("waliduje czy po wpisaniu prawidłowego emailu wywołuje setEmail i setStep", async () => {
    render(<EmailStep setStep={setStep} setEmail={setEmail} />);
    const user = userEvent.setup();
    const input = screen.getByLabelText(/Adres e-mail/i);
    const btn = screen.getByRole("button", { name: /Wyślij kod/i });

    await user.type(input, "student@student.pwr.edu.pl");
    await user.click(btn);

    await waitFor(() => {
      expect(setEmail).toHaveBeenCalledWith("student@student.pwr.edu.pl");
      expect(setStep).toHaveBeenCalledWith("otp");
    });
  });

  it("waliduje czy gdy serwer zwraca błąd, pokazuje toast.error", async () => {
    server.use(
      http.post(`${BASE_URL}/user/otp/get`, () =>
        HttpResponse.json(
          { success: false, message: "Wystąpił błąd podczas wysyłania kodu" },
          { status: 500 }
        )
      )
    );

    render(<EmailStep setStep={setStep} setEmail={setEmail} />);
    const user = userEvent.setup();
    const input = screen.getByLabelText(/Adres e-mail/i);
    const btn = screen.getByRole("button", { name: /Wyślij kod/i });

    await user.type(input, "student@student.pwr.edu.pl");
    await user.click(btn);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Wystąpił błąd podczas wysyłania kodu"
      );
    });
    expect(setStep).not.toHaveBeenCalled();
  });
});
