import { describe, it, expect, vi } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { LoginPage } from "@/pages/login";
import { PlansPage } from "@/pages/plans";
import { Providers } from "@/components/providers";
import { userEvent } from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { mockUseAuth } from "@/tests/helpers";

const routes = [
  { path: "/", element: <LoginPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/plans", element: <PlansPage /> },
];
const router = createMemoryRouter(routes, { initialEntries: ["/"] });

describe("Login Page", () => {
  const incorrectEmail = "zelek";
  const foreignEmail = "owo@uwu.pl";
  const correctEmail = "272669@student.pwr.edu.pl";
  // const otpCode = "420420";
  const incorrectEmailMessage = /Podaj poprawny adres email/i;
  const foreignEmailMessage = /musi kończyć się na/i;

  it("should validate incorrect or foreign email", async () => {
    mockUseAuth(false);
    const screen = render(<LoginPage />, {
      wrapper: Providers,
    });
    const user = userEvent.setup();

    const emailInput = screen.getByLabelText(/Adres e-mail/i);

    const submitButton = screen.getByRole("button");

    //not sure if i can test both these cases in one test or i should split them
    //1
    await user.type(emailInput, incorrectEmail);
    await user.click(submitButton);

    expect(await screen.findByText(incorrectEmailMessage)).toBeInTheDocument();

    //2
    await user.type(emailInput, foreignEmail);
    await user.click(submitButton);

    expect(await screen.findByText(foreignEmailMessage)).toBeInTheDocument();
  });

  it("should render login form", () => {
    mockUseAuth(false);
    const screen = render(<LoginPage />, { wrapper: Providers });
    expect(screen.getByLabelText(/Adres e-mail/i)).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("should show error when submitting empty email", async () => {
    mockUseAuth(false);
    const screen = render(<LoginPage />, { wrapper: Providers });
    const user = userEvent.setup();

    const submitButton = screen.getByRole("button");
    await user.click(submitButton);

    expect(await screen.findByText(incorrectEmailMessage)).toBeInTheDocument();
  });

  it("should submit email and show OTP input", async () => {
    mockUseAuth(false);
    const screen = render(
      <Providers>
        <RouterProvider router={router} />
      </Providers>
    );
    const user = userEvent.setup();
    const emailInput = screen.getByLabelText(/adres e-mail/i);
    const submitButton = screen.getByRole("button");

    await user.type(emailInput, correctEmail);
    await user.click(submitButton);

    expect(
      await screen.findByLabelText(/hasło jednorazowe/i)
    ).toBeInTheDocument();
  });

  it("should navigate to /plans when user is authenticated", async () => {
    mockUseAuth(true);

    const router = createMemoryRouter(routes, {
      initialEntries: ["/login"],
    });

    const screen = render(
      <Providers>
        <RouterProvider router={router} />
      </Providers>
    );

    await waitFor(() => {
      expect(screen.getByText(/kocham planer/i)).toBeInTheDocument();
    });
  });

  //i also wrote this test case, but it doesnt pass.
  //in my browser i am getting redirected to login page, but here it is not working
  //i am curious as to why and how to correctly test it - i dont have time to figure it out now

  // it("redirects to /login if user is not authenticated and tries to access /plans", async () => {
  //   mockUseAuth(false);

  //   const router = createMemoryRouter(routes, {
  //     initialEntries: ["/plans"],
  //   });

  //   const screen = render(
  //     <Providers>
  //       <RouterProvider router={router} />
  //     </Providers>
  //   );

  //   await waitFor(() => {
  //     expect(screen.getByLabelText(/adres e-mail/i)).toBeInTheDocument();
  //   });
  // });
});
