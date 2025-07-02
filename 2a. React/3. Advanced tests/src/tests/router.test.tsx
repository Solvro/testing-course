import { it, expect, describe, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { useAuth } from "@/hooks/use-auth";
import { createMemoryRouter, RouterProvider } from "react-router";
import { Providers } from "@/components/providers";
import { routes } from "@/routes";

vi.mock("@/hooks/use-auth");

const mockAuthState = (isAuthenticated: boolean) => {
  vi.mocked(useAuth).mockReturnValue({
    isAuthenticated,
    user: null,
    login: vi.fn(),
    logout: vi.fn(),
  });
};

const redirect = (path: string) => {
  const router = createMemoryRouter(routes, {
    initialEntries: [path],
  });
  render(<RouterProvider router={router} />, { wrapper: Providers });
};

describe("Router", () => {
  it("should render a login page at /", () => {
    mockAuthState(false);
    redirect("/");
    expect(screen.getByText(/zaloguj/i)).toBeInTheDocument();
  });

  it("should redirect to login when accessing /plans as unauthenticated user", async () => {
    mockAuthState(false);
    redirect("/plans");
    expect(screen.getByText(/zaloguj/i)).toBeInTheDocument();
  });

  it("should render a plans page at /plans", () => {
    mockAuthState(true);
    redirect("/plans");
    expect(screen.getByText(/kocham planer/i)).toBeInTheDocument();
  });

  it("should redirect to plans when accessing / as authenticated user", () => {
    mockAuthState(true);
    redirect("/");
    expect(screen.getByText(/kocham planer/i)).toBeInTheDocument();
  });
});
