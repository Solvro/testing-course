import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { LoginPage } from "@/pages/login";
import { Providers } from "@/components/providers";
import { userEvent } from "@testing-library/user-event";
import { MemoryRouter } from "react-router";

// To jest tylko przykładowy test, żeby łatwiej wam było zacząć - możecie go usunąć lub zmodyfikować
describe("Login Page", () => {
  const setupTest = () => {
    const screen = render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>, {
      wrapper: Providers,
    });
    const user = userEvent.setup();
    return { user, screen };
  };

  it("should validate email", async () => {
    const { user, screen } = setupTest();
    const emailInput = screen.getByLabelText("Adres e-mail");
    const submitButton = screen.getByRole("button");

    await user.type(emailInput, "invalid-email");
    await user.click(submitButton);

    expect(screen.getByText(/podaj poprawny/i)).toBeInTheDocument();
    expect(screen.queryByText(/hasło jednorazowe/i)).not.toBeInTheDocument();
  });

  it("should render OTP field if valid email", async () => {
    const { user, screen } = setupTest();
    const emailInput = screen.getByLabelText("Adres e-mail");
    const submitButton = screen.getByRole("button");

    await user.type(emailInput, "111111@student.pwr.edu.pl");
    await user.click(submitButton);

    expect(screen.queryByText(/podaj poprawny/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/hasło jednorazowe/i)).toBeInTheDocument();
  });
});
