import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { LoginPage } from "@/pages/login";
import { Providers } from "@/components/providers";
import { MOCK_OTP } from "../mocks/handlers";

describe("Login page", () => {
  const renderPage = () => {
    render(<LoginPage />, { wrapper: Providers });

    return {
      emailInput: screen.getByRole("textbox", { name: /e-mail/i }),
      submitButton: screen.getByRole("button"),
    };
  };

  it("should render a login form", async () => {
    const { emailInput } = renderPage();
    expect(emailInput).toBeInTheDocument();
  });

  it("should reject emails with wrong domain", async () => {
    const { emailInput, submitButton } = renderPage();

    const user = userEvent.setup();

    await user.type(emailInput, "test@onet.pl");
    await user.click(submitButton);

    expect(screen.getByText(/pwr.edu.pl/i));
  });

  it("should reject invalid emails", async () => {
    const { emailInput, submitButton } = renderPage();

    const user = userEvent.setup();

    await user.type(emailInput, "abcd");
    await user.click(submitButton);

    expect(screen.getByText(/poprawny/i));
  });

  it("should log an OTP code after successfull submission", async () => {
    const { emailInput, submitButton } = renderPage();
    const consoleSpy = vi.spyOn(console, "info");

    const user = userEvent.setup();

    await user.type(emailInput, "test@student.pwr.edu.pl");
    await user.click(submitButton);

    await new Promise((r) => setTimeout(r, 500));

    expect(consoleSpy).toBeCalledWith(
      expect.stringMatching(new RegExp(`Kod OTP to ${MOCK_OTP}`, "i"))
    );
  });
});
