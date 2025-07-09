import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { routes } from "@/routes";

const mockConsoleInfo = vi.spyOn(console, "info").mockImplementation(() => {});

describe("LoginPage Integration Tests", () => {
  beforeEach(() => {
    mockConsoleInfo.mockClear();
  });

  it("renders login page with email step", () => {
    const router = createMemoryRouter(routes, {
      initialEntries: ["/"],
    });

    render(<RouterProvider router={router} />);

    expect(screen.getByRole("heading", { name: /zaloguj się do planera/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/adres e-mail/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /wyślij kod/i })).toBeInTheDocument();
  });

  it("validates email format", async () => {
    const user = userEvent.setup();
    const router = createMemoryRouter(routes, {
      initialEntries: ["/"],
    });

    render(<RouterProvider router={router} />);

    const emailInput = screen.getByLabelText(/adres e-mail/i);
    const submitButton = screen.getByRole("button", { name: /wyślij kod/i });

    await user.type(emailInput, "invalid-email");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/podaj poprawny adres email/i)).toBeInTheDocument();
    });

    await user.clear(emailInput);
    await user.type(emailInput, "test@gmail.com");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/adres email musi kończyć się na @student\.pwr\.edu\.pl/i)).toBeInTheDocument();
    });
  });

  it("sends OTP request with valid email and shows OTP step", async () => {
    const user = userEvent.setup();
    const router = createMemoryRouter(routes, {
      initialEntries: ["/"],
    });

    render(<RouterProvider router={router} />);

    const emailInput = screen.getByLabelText(/adres e-mail/i);
    const submitButton = screen.getByRole("button", { name: /wyślij kod/i });

    await user.type(emailInput, "test@student.pwr.edu.pl");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByLabelText(/hasło jednorazowe/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(mockConsoleInfo).toHaveBeenCalledWith("Kod OTP to 123456 😍");
    });
  });

  it("displays proper UI elements", () => {
    const router = createMemoryRouter(routes, {
      initialEntries: ["/"],
    });

    render(<RouterProvider router={router} />);

    const logos = screen.getAllByAltText(/solvro logo/i);
    expect(logos).toHaveLength(2);
    
    expect(screen.getByText(/podaj swój email z domeny politechniki wrocławskiej/i)).toBeInTheDocument();
    
    expect(screen.getByText(/wyświetlimy ci go w konsoli/i)).toBeInTheDocument();
  });

  it("completes full authentication flow", async () => {
    const user = userEvent.setup();
    const router = createMemoryRouter(routes, {
      initialEntries: ["/"],
    });

    render(<RouterProvider router={router} />);

    const emailInput = screen.getByLabelText(/adres e-mail/i);
    const submitButton = screen.getByRole("button", { name: /wyślij kod/i });

    await user.type(emailInput, "test@student.pwr.edu.pl");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByLabelText(/hasło jednorazowe/i)).toBeInTheDocument();
    });

    const otpInput = screen.getByRole("textbox");
    await user.type(otpInput, "123456");

    const loginButton = screen.getByRole("button", { name: /zaloguj się/i });
    await user.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText(/planer - kocham planer/i)).toBeInTheDocument();
    });
  });
});
