import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import * as authHook from "../hooks/use-auth";
import { navigateTo } from "@/lib/utils";

describe("ProtectedRoute", () => {
  const useAuthMock = vi.spyOn(authHook, "useAuth");

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("gdy jest zalogowany, renderuje zawartość chronionej trasy", () => {
    useAuthMock.mockReturnValue({
      isAuthenticated: true,
      user: { email: "x@student.pwr.edu.pl" },
      login: vi.fn(),
      logout: vi.fn(),
    });

    navigateTo("/plans");
    expect(
      screen.getByRole("heading", { name: /Planer - kocham planer/i })
    ).toBeInTheDocument();
  });
});
