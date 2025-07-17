import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { LoginPage } from "@/pages/login";
import { Providers } from "@/components/providers";
import { userEvent } from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { routes } from "@/routes.tsx";
import { OTP } from "@/tests/mocks/handlers.ts";
import { PlansPage } from "@/pages/plans.tsx";

const renderLoginPage = () => {
  const router = createMemoryRouter(routes, {
    initialEntries: ["/"],
  });

  return render(
    <RouterProvider router={router}>
      <Providers>
        <LoginPage />
      </Providers>
    </RouterProvider>
  );
};

const renderPlansPage = () => {
  const router = createMemoryRouter(routes, {
    initialEntries: ["/plans"],
  });

  return render(
    <RouterProvider router={router}>
      <Providers>
        <PlansPage />
      </Providers>
    </RouterProvider>
  );
};

describe("Login Page", async () => {
  it("should display all form fields and button", () => {
    const screen = renderLoginPage();

    const emailField = screen.getByPlaceholderText(/@student.pwr.edu.pl/);
    const submitBtn = screen.getByRole("button");

    expect(emailField).toBeInTheDocument();
    expect(submitBtn)
      .toBeInTheDocument()
      .toHaveTextContent(/wyślij kod/i);
  });

  it("should show error message when invalid email submitted", async () => {
    const screen = renderLoginPage();

    const user = userEvent.setup();
    const emailInput = screen.getByLabelText("Adres e-mail");
    const submitButton = screen.getByRole("button");

    await user.type(emailInput, "invalid-email");
    await user.click(submitButton);

    const message = screen.getByText(/podaj poprawny/i);
    expect(message).toBeInTheDocument();
  });

  it("should display otp form step on valid email submit", async () => {
    const screen = renderLoginPage();

    const user = userEvent.setup();
    const emailInput = screen.getByLabelText("Adres e-mail");
    const submitButton = screen.getByRole("button");

    await user.type(emailInput, "123@student.pwr.edu.pl");
    await user.click(submitButton);

    const label = await screen.findByLabelText("Hasło jednorazowe");
    const submitBtn = screen.getByText("Zaloguj się");

    expect(label).toBeInTheDocument();
    expect(submitBtn).toBeInTheDocument();
  });

  it("should redirect to dashboard on correct OTP code submit", async () => {
    const screen = renderLoginPage();

    const user = userEvent.setup();
    const emailInput = screen.getByLabelText("Adres e-mail");
    const submitButton = screen.getByRole("button");

    await user.type(emailInput, "123@student.pwr.edu.pl");
    await user.click(submitButton);

    const otpInput = await screen.findByLabelText(/hasło jednorazowe/i);
    const submitBtn = await screen.findByText("Zaloguj się");

    await user.type(otpInput, OTP.toString());
    await user.click(submitBtn);

    const dashboardHeading = await screen.findByText("Planer - kocham planer");
    expect(dashboardHeading).toBeInTheDocument();
  });

  it("should show error message on invalid OTP code submit", async () => {
    const screen = renderLoginPage();

    const user = userEvent.setup();
    const emailInput = screen.getByLabelText("Adres e-mail");
    const submitButton = screen.getByRole("button");

    await user.type(emailInput, "123@student.pwr.edu.pl");
    await user.click(submitButton);

    const otpInput = await screen.findByLabelText(/hasło jednorazowe/i);
    const submitBtn = await screen.findByText("Zaloguj się");

    await user.type(otpInput, "232123");
    await user.click(submitBtn);

    const message = await screen.findByText(/invalid otp/i);
    expect(message).toBeInTheDocument();
  });

  it("should redirect to / on plans page when unauthorized", async () => {
    const screen = renderPlansPage();
    const heading = await screen.findByText("Zaloguj się do planera");
    expect(heading).toBeInTheDocument();
  });
});
