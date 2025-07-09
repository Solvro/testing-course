import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { LoginPage } from "@/pages/login";
import { Providers } from "@/components/providers";
import { userEvent } from "@testing-library/user-event";
import { MemoryRouter } from "react-router";

const renderComponent = () => {
  const screen = render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
    {
      wrapper: Providers,
    }
  );
  const user = userEvent.setup();
  return { user, screen };
};

describe("Login Page", () => {
  it("should render login page", () => {
    const { screen } = renderComponent();

    expect(screen.getByText(/Zaloguj się do planera/i)).toBeInTheDocument();
  });
  it("should validate email", async () => {
    const { screen, user } = renderComponent();

    const emailInput = screen.getByLabelText("Adres e-mail");

    const submitButton = screen.getByRole("button");

    await user.type(emailInput, "invalid-email");
    await user.click(submitButton);

    expect(screen.getByText(/podaj poprawny/i)).toBeInTheDocument();
  });
  it("should render OTP input if email is valid", async () => {
    const { screen, user } = renderComponent();

    const emailInput = screen.getByLabelText("Adres e-mail");
    const submitButton = screen.getByRole("button");

    await user.type(emailInput, "valid-email@student.pwr.edu.pl");
    await user.click(submitButton);

    expect(
      await screen.findByLabelText(/hasło jednorazowe/i)
    ).toBeInTheDocument();
  });
});
