import { render, screen, waitFor, cleanup } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { userEvent } from "@testing-library/user-event";
import { vi, expect } from "vitest";
import { routes } from "@/routes";
import { useAuth } from "@/hooks/use-auth";
import React from "react";

export const mockAuth = (overrides: Partial<ReturnType<typeof useAuth>> = {}) => {
  return vi.mocked(useAuth).mockReturnValue({
    isAuthenticated: false,
    user: null,
    login: vi.fn(),
    logout: vi.fn(),
    ...overrides,
  });
};

export const setupLoginPage = () => {
  cleanup();
  
  const router = createMemoryRouter(routes, {
    initialEntries: ["/"],
  });

  const renderResult = render(
    React.createElement(RouterProvider, { router })
  );

  const user = userEvent.setup();

  return {
    ...renderResult,
    user,
    router,
  };
};

export const getEmailElements = () => {
  const emailInput = screen.getByPlaceholderText(/student.pwr.edu.pl/i);
  const submitButton = screen.getByRole("button", { name: /wyślij kod/i });
  
  return { emailInput, submitButton };
};

export const submitEmail = async (emailValue: string) => {
  mockAuth();
  const { user } = setupLoginPage();
  const { emailInput, submitButton } = getEmailElements();
  
  await user.type(emailInput, emailValue);
  await user.click(submitButton);
  
  return { user, emailInput, submitButton };
};

export const setupOtpStep = async () => {
  mockAuth();
  const { user, router } = setupLoginPage();
  const { emailInput, submitButton } = getEmailElements();

  await user.type(emailInput, "123456@student.pwr.edu.pl");
  await user.click(submitButton);

  await waitFor(() => {
    expect(screen.getByText("Hasło jednorazowe")).toBeInTheDocument();
  });

  return { user, router };
};

export const getOtpElements = () => {
  const otpInput = screen.getByRole("textbox");
  const loginButton = screen.getByRole("button", { name: /zaloguj się/i });
  
  return { otpInput, loginButton };
};

export const submitOtp = async (otpValue: string) => {
  const { user, router } = await setupOtpStep();
  const { otpInput, loginButton } = getOtpElements();

  await user.type(otpInput, otpValue);
  await user.click(loginButton);

  return { user, otpInput, loginButton, router };
};

export const completeEmailToOtpFlow = async (email: string) => {
  const { emailInput, submitButton } = getEmailElements();
  const user = userEvent.setup();

  await user.type(emailInput, email);
  await user.click(submitButton);

  await waitFor(() => {
    expect(screen.getByText("Hasło jednorazowe")).toBeInTheDocument();
  });

  return { user };
};
