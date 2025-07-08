import { useAuth } from "@/hooks/use-auth";
import { vi } from "vitest";
import { routes } from "@/routes";
import { render } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";

export type MockedAuthState = {
  isAuthenticated: boolean;
  user: { email: string } | null;
};

export const mockAuthState = (authState: MockedAuthState) => {
  vi.mocked(useAuth).mockReturnValue({
    ...authState,
    login: vi.fn(),
    logout: vi.fn(),
  });
};

export const navigateTo = (path: string) => {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(<RouterProvider router={router} />);
};
