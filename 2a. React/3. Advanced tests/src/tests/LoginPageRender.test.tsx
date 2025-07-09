import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { navigateTo } from "@/lib/utils";

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    isAuthenticated: false,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

describe("LoginPage", () => {
  it("renderuje krok email: tytuł, input i przycisk", () => {
    navigateTo("/");

    expect(
      screen.getByRole("heading", { name: /Zaloguj się do planera/i })
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/Adres e-mail/i)).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /Wyślij kod/i })
    ).toBeInTheDocument();
  });
});
