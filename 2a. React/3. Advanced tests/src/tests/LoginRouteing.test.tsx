import { describe, it, expect, beforeEach, vi, type Mock } from "vitest";
import { screen } from "@testing-library/react";
import { navigateTo } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

vi.mock("@/hooks/use-auth");

describe("Routing", () => {
  const useAuthMock = useAuth as Mock;

  beforeEach(() => {
    useAuthMock.mockReturnValue({
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
    });
  });

  it("waliduje czy dobrze przekierowuje do /", async () => {
    navigateTo("/");
    expect(screen.getByText("Zaloguj się do planera")).toBeInTheDocument();
  });

  it("gdy JEST zalogowany → pokazuje PlansPage", () => {
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
