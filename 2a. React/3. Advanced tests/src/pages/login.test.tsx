import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LoginPage } from "@/pages/login";
import { PlansPage } from "@/pages/plans";
import { Layout } from "@/pages/layout";
import { Providers } from "@/components/providers";
import { server } from "@/tests/mocks/server";
import { handlers } from "@/tests/mocks/handlers";

const consoleInfoSpy = vi.spyOn(console, "info").mockImplementation(() => {});

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

describe("LoginPage", () => {
  beforeEach(() => {
    consoleInfoSpy.mockClear();

    if (typeof document.elementFromPoint !== "function") {
      document.elementFromPoint = vi.fn(() => document.body);
    }
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Email validation", () => {
    it("should show error for incorrect emails", async () => {
      render(<LoginPage />, { wrapper: Providers });
      const user = userEvent.setup();

      const emailInput = screen.getByLabelText("Adres e-mail");
      const submitButton = screen.getByRole("button", { name: /wyślij kod/i });

      await user.type(emailInput, "invalid-email");
      await user.click(submitButton);

      expect(
        await screen.findByText(/podaj poprawny adres email/i)
      ).toBeInTheDocument();
    });

    it("should show error for emails with incorrect domain part", async () => {
      render(<LoginPage />, { wrapper: Providers });
      const user = userEvent.setup();

      const emailInput = screen.getByLabelText("Adres e-mail");
      const submitButton = screen.getByRole("button", { name: /wyślij kod/i });

      await user.type(emailInput, "volodymyr_haideichuk@gmail.com");
      await user.click(submitButton);

      expect(
        await screen.findByText(
          /email musi kończyć się na @student.pwr.edu.pl/i
        )
      ).toBeInTheDocument();
    });

    it("should render planer page after correct email and OTP", async () => {
      server.use(...handlers);

      const router = createTestRouter(["/login"]);
      const screen = render(<RouterProvider router={router} />, {
        wrapper: Providers,
      });
      const user = userEvent.setup();

      const emailInput = screen.getByLabelText("Adres e-mail");
      const submitButton = screen.getByRole("button", { name: /wyślij kod/i });

      await user.type(emailInput, "282267@student.pwr.edu.pl");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/hasło jednorazowe/i)).toBeInTheDocument();
        expect(
          screen.getByText(/wpisz kod, który wylądował/i)
        ).toBeInTheDocument();
      });

      const passwordInput = screen.getByLabelText(/hasło jednorazowe/i);

      await user.type(passwordInput, "282267");
      const logInButton = screen.getByRole("button", { name: /zaloguj się/i });

      await user.click(logInButton);

      expect(
        await screen.findByText(/planer - kocham planer/i)
      ).toBeInTheDocument();
    });
  });
});
