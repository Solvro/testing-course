import { afterEach, beforeEach, vi, describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { server } from "@/tests/mocks/server";
import { BASE_URL } from "@/api/base-url";
import { LoginPage } from "@/pages/login";
import { Providers } from "@/components/providers";
import { userEvent } from "@testing-library/user-event";
import { Layout } from "@/pages/layout";
import { PlansPage } from "@/pages/plans";
import { http, HttpResponse } from "msw";
import { createMemoryRouter, RouterProvider } from "react-router";

const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
const createTestRouter = (initialEntries: string[] = ["/login"]) => {
  return createMemoryRouter(
    [
      {
        path: "/",
        element: <Layout />,
        children: [
          {
            path: "login",
            element: <LoginPage />,
          },
          {
            path: "plans",
            element: <PlansPage />,
          },
        ],
      },
    ],
    {
      initialEntries,
    }
  );
};
// To jest tylko przykładowy test, żeby łatwiej wam było zacząć - możecie go usunąć lub zmodyfikować
describe("Login Page", () => {
  beforeEach(() => {
    consoleSpy.mockClear();
    if (typeof document.elementFromPoint !== "function") {
      document.elementFromPoint = vi.fn(() => document.body);
    }

    server.listen({ onUnhandledRequest: "warn" });
  });
  afterEach(() => {
    vi.clearAllMocks();
    server.resetHandlers();
  });
  it("should validate my email", async () => {
    const screen = render(<LoginPage />, {
      wrapper: Providers,
    });
    const user = userEvent.setup();

    const emailInput = screen.getByLabelText("Adres e-mail");

    const submitButton = screen.getByRole("button");
    expect(submitButton).not.toBeDisabled();
    await user.type(emailInput, "invalid-email");
    await user.click(submitButton);
    expect(await screen.findByText(/podaj poprawny/i)).toBeInTheDocument();
    // Co dalej?
    screen.debug();
  });

  it("should inform that i used wrong email", async () => {
    const screen = render(<LoginPage />, {
      wrapper: Providers,
    });
    const user = userEvent.setup();

    const emailInput = screen.getByLabelText("Adres e-mail");

    const submitButton = screen.getByRole("button");

    await user.type(emailInput, "gaming@gmail.com");
    await user.click(submitButton);
    expect(await screen.findByText(/@student.pwr.edu.pl/i)).toBeInTheDocument();
  });
  it("should change and ask me for password)", async () => {
    const screen = render(<LoginPage />, {
      wrapper: Providers,
    });
    const user = userEvent.setup();

    const emailInput = screen.getByLabelText("Adres e-mail");

    const submitButton = screen.getByRole("button");

    await user.type(emailInput, "gaming@student.pwr.edu.pl");
    await user.click(submitButton);
    expect(await screen.findByText(/zaloguj/i)).toBeInTheDocument();
  });

  it("should log in planner  after getting correct email and password", async () => {
    server.use(
      http.post(`${BASE_URL}/user/otp/get`, () => {
        return HttpResponse.json({
          success: true,
          message: "OTP sent successfully",
          otp: "121212",
        });
      }),
      http.post(`${BASE_URL}/user/otp/verify`, () => {
        return HttpResponse.json({
          success: true,
          message: "Logged in successfully",
          email: "piwo@student.pwr.edu.pl",
        });
      })
    );

    const user = userEvent.setup();
    const router = createTestRouter(["/login"]);
    const screen = render(<RouterProvider router={router} />, {
      wrapper: Providers,
    });

    const emailInput = screen.getByLabelText(/adres e-mail/i);
    const sendCodeButton = screen.getByRole("button", { name: /wyślij kod/i });

    await user.type(emailInput, "piwo@student.pwr.edu.pl");
    await user.click(sendCodeButton);

    await expect(screen.getByText(/jednorazowe/i)).toBeInTheDocument();

    const passwordInput = await screen.findByLabelText(/jednorazowe/i);
    await user.type(passwordInput, "121212");
    const loginButton = screen.getByRole("button", { name: /zaloguj/i });
    await user.click(loginButton);

    expect(await screen.findByText(/kocham/i)).toBeInTheDocument();
  });
});
