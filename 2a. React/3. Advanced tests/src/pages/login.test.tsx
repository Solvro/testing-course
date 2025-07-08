import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { createMemoryRouter, RouterProvider, Outlet } from "react-router-dom";
import { Providers } from "@/components/providers";
import { LoginPage } from "@/pages/login";
import { PlansPage } from "@/pages/plans";
import { ProtectedRoute } from "@/components/protected-route";

const TestAppLayout = () => {
  return (
    <Providers>
      <Outlet />
    </Providers>
  );
};

const routesConfig = [
  {
    element: <TestAppLayout />,
    children: [
      {
        path: "/",
        element: <LoginPage />,
      },
      {
        path: "/plans",
        element: (
          <ProtectedRoute>
            <PlansPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
];

const renderWithRouter = (initialEntries = ["/"]) => {
  const router = createMemoryRouter(routesConfig, {
    initialEntries,
  });
  render(<RouterProvider router={router} />);
};

describe("Login and Authentication Flow", () => {
  const user = userEvent.setup();
  const validEmail = "123456@student.pwr.edu.pl";
  const correctOtp = "123456";

  it("should show validation error for an invalid email", async () => {
    renderWithRouter();

    await user.type(screen.getByLabelText(/adres e-mail/i), "invalid@email.com");
    await user.click(screen.getByRole("button", { name: /wyślij kod/i }));

    expect(
      await screen.findByText(
        /adres email musi kończyć się na @student.pwr.edu.pl/i,
      ),
    ).toBeInTheDocument();
  });

  it("should successfully log in and redirect to /plans on correct credentials", async () => {
    renderWithRouter();

    await user.type(screen.getByLabelText(/adres e-mail/i), validEmail);
    await user.click(screen.getByRole("button", { name: /wyślij kod/i }));

    const otpInput = await screen.findByLabelText(/hasło jednorazowe/i);
    await user.type(otpInput, correctOtp);
    await user.click(screen.getByRole("button", { name: /zaloguj się/i }));

    expect(
      await screen.findByText(/przeglądaj i porównuj różne wersje planu/i),
    ).toBeInTheDocument();
  });

  it("should show an error for incorrect OTP", async () => {
    renderWithRouter();

    await user.type(screen.getByLabelText(/adres e-mail/i), validEmail);
    await user.click(screen.getByRole("button", { name: /wyślij kod/i }));

    const otpInput = await screen.findByLabelText(/hasło jednorazowe/i);
    await user.type(otpInput, "213769");
    await user.click(screen.getByRole("button", { name: /zaloguj się/i }));

    expect(
      await screen.findByText(/nieprawidłowy kod otp lub email/i),
    ).toBeInTheDocument();
  });

  it("should redirect from a protected route to login page if not authenticated", async () => {
    renderWithRouter(["/plans"]);

    expect(await screen.findByLabelText(/adres e-mail/i)).toBeInTheDocument();
    expect(
      screen.queryByText(/przeglądaj i porównuj różne wersje planu/i),
    ).not.toBeInTheDocument();
  });

  it("should allow a logged-in user to log out", async () => {
    renderWithRouter();
    await user.type(screen.getByLabelText(/adres e-mail/i), validEmail);
    await user.click(screen.getByRole("button", { name: /wyślij kod/i }));
    const otpInput = await screen.findByLabelText(/hasło jednorazowe/i);
    await user.type(otpInput, correctOtp);
    await user.click(screen.getByRole("button", { name: /zaloguj się/i }));

    const logoutButton = await screen.findByRole("button", {
      name: /wyloguj/i,
    });

    await user.click(logoutButton);

    expect(
      await screen.findByText(/zaloguj się do planera/i),
    ).toBeInTheDocument();
  });
});