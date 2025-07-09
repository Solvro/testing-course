import { describe, expect, it, vi } from "vitest"
import { routes } from "@/routes";
import { createMemoryRouter, RouterProvider } from "react-router";
import { render, screen } from "@testing-library/react";
import { useAuth } from "@/hooks/use-auth";

vi.mock("@/hooks/use-auth", () => ({
  useAuth: vi.fn(),
}));

describe("Router", () => {
  it("should render the index page", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      login: vi.fn(),
      logout: vi.fn(),
      isAuthenticated: false,
    });

    const router = createMemoryRouter(routes, { initialEntries: ['/'] });
    render(<RouterProvider router={router} />);
    expect(screen.getByText(/Zaloguj się/i)).toBeInTheDocument();
  });

  it("should render the plans page", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { email: "test@student.pwr.edu.pl" },
      login: vi.fn(),
      logout: vi.fn(),
      isAuthenticated: true,
    });

    const router = createMemoryRouter(routes, { initialEntries: ['/plans'] });
    render(<RouterProvider router={router} />);
    expect(screen.getByText(/kocham planer/i)).toBeInTheDocument();
  });
});