import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { routes } from "@/routes";
import { Providers } from "@/components/providers";

const mockLogin = vi.fn();
const mockLogout = vi.fn();
const mockAuthContext = {
  user: null as null | { email: string },
  login: mockLogin,
  logout: mockLogout,
  isAuthenticated: false,
};

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => mockAuthContext,
}));

describe("Routing Tests", () => {
  beforeEach(() => {
    mockLogin.mockClear();
    mockLogout.mockClear();
    mockAuthContext.user = null;
    mockAuthContext.isAuthenticated = false;
  });

  it("renders login page on root path", () => {
    const router = createMemoryRouter(routes, {
      initialEntries: ["/"],
    });

    render(<RouterProvider router={router} />, {
      wrapper: Providers,
    });

    expect(screen.getByRole("heading", { name: /zaloguj się do planera/i })).toBeInTheDocument();
  });

  it("redirects unauthenticated users from /plans to /", () => {
    const router = createMemoryRouter(routes, {
      initialEntries: ["/plans"],
    });

    render(<RouterProvider router={router} />, {
      wrapper: Providers,
    });

    expect(screen.getByRole("heading", { name: /zaloguj się do planera/i })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/");
  });

  it("allows authenticated users to access /plans", () => {
    mockAuthContext.user = { email: "test@student.pwr.edu.pl" };
    mockAuthContext.isAuthenticated = true;

    const router = createMemoryRouter(routes, {
      initialEntries: ["/plans"],
    });

    render(<RouterProvider router={router} />, {
      wrapper: Providers,
    });

    expect(screen.getByText(/planer - kocham planer/i)).toBeInTheDocument();
    expect(screen.getByText(/test@student\.pwr\.edu\.pl/i)).toBeInTheDocument();
  });

  it("redirects authenticated users from / to /plans", () => {
    mockAuthContext.user = { email: "test@student.pwr.edu.pl" };
    mockAuthContext.isAuthenticated = true;

    const router = createMemoryRouter(routes, {
      initialEntries: ["/"],
    });

    render(<RouterProvider router={router} />, {
      wrapper: Providers,
    });

    expect(screen.getByText(/planer - kocham planer/i)).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/plans");
  });

  it("navigates after successful login", async () => {
    const router = createMemoryRouter(routes, {
      initialEntries: ["/"],
    });

    render(<RouterProvider router={router} />, {
      wrapper: Providers,
    });

    const user = userEvent.setup();

    const emailInput = screen.getByLabelText(/adres e-mail/i);
    const submitButton = screen.getByRole("button", { name: /wyślij kod/i });

    await user.type(emailInput, "test@student.pwr.edu.pl");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByLabelText(/hasło jednorazowe/i)).toBeInTheDocument();
    });

    mockAuthContext.user = { email: "test@student.pwr.edu.pl" };
    mockAuthContext.isAuthenticated = true;

    const otpInput = screen.getByRole("textbox");
    await user.type(otpInput, "123456");

    const loginButton = screen.getByRole("button", { name: /zaloguj się/i });
    await user.click(loginButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("test@student.pwr.edu.pl");
    });
  });

  it("handles logout and redirects to login", async () => {
    mockAuthContext.user = { email: "test@student.pwr.edu.pl" };
    mockAuthContext.isAuthenticated = true;

    const router = createMemoryRouter(routes, {
      initialEntries: ["/plans"],
    });

    render(<RouterProvider router={router} />, {
      wrapper: Providers,
    });

    const user = userEvent.setup();

    expect(screen.getByText(/planer - kocham planer/i)).toBeInTheDocument();

    const logoutButton = screen.getByRole("button", { name: /wyloguj/i });
    await user.click(logoutButton);

    mockAuthContext.user = null;
    mockAuthContext.isAuthenticated = false;

    expect(mockLogout).toHaveBeenCalled();
  });

  it("handles invalid routes", () => {
    const router = createMemoryRouter(routes, {
      initialEntries: ["/invalid-route"],
    });

    render(<RouterProvider router={router} />, {
      wrapper: Providers,
    });

    expect(screen.getByRole("heading", { name: /unexpected application error/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /404 not found/i })).toBeInTheDocument();
  });

  it("maintains route state during authentication flow", async () => {
    const router = createMemoryRouter(routes, {
      initialEntries: ["/"],
    });

    render(<RouterProvider router={router} />, {
      wrapper: Providers,
    });

    const user = userEvent.setup();

    expect(router.state.location.pathname).toBe("/");

    const emailInput = screen.getByLabelText(/adres e-mail/i);
    const submitButton = screen.getByRole("button", { name: /wyślij kod/i });

    await user.type(emailInput, "test@student.pwr.edu.pl");
    await user.click(submitButton);

    expect(router.state.location.pathname).toBe("/");

    await waitFor(() => {
      expect(screen.getByLabelText(/hasło jednorazowe/i)).toBeInTheDocument();
    });

    expect(router.state.location.pathname).toBe("/");
  });

  it("works with browser navigation", () => {
    const router = createMemoryRouter(routes, {
      initialEntries: ["/", "/plans"],
      initialIndex: 1,
    });

    render(<RouterProvider router={router} />, {
      wrapper: Providers,
    });

    expect(screen.getByRole("heading", { name: /zaloguj się do planera/i })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/");
  });
});
