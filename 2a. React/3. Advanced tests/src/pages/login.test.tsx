import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LoginPage } from "@/pages/login";
import { Providers } from "@/components/providers";
import { userEvent } from "@testing-library/user-event";
import { createMemoryRouter, MemoryRouter, RouterProvider } from "react-router";
import type { ReactNode } from "react";
import { mockAuthState } from "@/tests/setup";
import { routes } from "@/routes";

// To jest tylko przykładowy test, żeby łatwiej wam było zacząć - możecie go usunąć lub zmodyfikować
describe("Login Page", () => {
  const renderWithRouter = (children: ReactNode) => {
    return render(<MemoryRouter initialEntries={["/"]}>{children}</MemoryRouter>, { wrapper: Providers });
  };

  it("should validate my email", async () => {
    render(<LoginPage />, {
      wrapper: Providers,
    });
    const user = userEvent.setup();

    const emailInput = screen.getByLabelText("Adres e-mail");

    const submitButton = screen.getByRole("button");

    await user.type(emailInput, "invalid-email");
    await user.click(submitButton);

    expect(screen.getByText(/podaj poprawny/i)).toBeInTheDocument();
  });

  it("should display toast after sending valid email", async () => {
    const screen = renderWithRouter(<LoginPage />);
    const user = userEvent.setup();

    const emailInput = screen.getByLabelText("Adres e-mail");

    const submitButton = screen.getByRole("button");

    await user.type(emailInput, "dodi@student.pwr.edu.pl");
    await user.click(submitButton);
    expect(await screen.findByText(/wpisz kod/i)).toBeInTheDocument();
    const otp = screen.getByRole("textbox");
    await user.type(otp, "123456");
    const submitButton2 = screen.getByRole("button");
    await user.click(submitButton2);
    expect(await screen.findByText(/zalogowano pomyślnie/i)).toBeInTheDocument();
  });
});

describe("Router", () => {
  const navigateTo = (path: string) => {
    const router = createMemoryRouter(routes, { initialEntries: [path] });
    render(<RouterProvider router={router} />);
  };
  it("login page", () => {
    mockAuthState({
      isAuthenticated: false,
      user: null,
    });
    navigateTo("/");
    expect(screen.getByText(/zaloguj/i)).toBeInTheDocument();
  });
  it("plans page", () => {
    mockAuthState({
      isAuthenticated: true,
      user: { email: "dodi@student.pwr.edu.pl" },
    });
    navigateTo("/plans");
    expect(screen.getByText(/planer/i)).toBeInTheDocument();
  });
});
