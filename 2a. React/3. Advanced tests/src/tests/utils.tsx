import { Providers } from "@/components/providers";
import { useAuth } from "@/hooks/use-auth";
import { routes } from "@/routes";
import { render } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { vi } from "vitest";

vi.mock("@/hooks/use-auth");

export const navigateTo = (path: string) => {
  const router = createMemoryRouter(routes, {
    initialEntries: [path],
  });

  render(<RouterProvider router={router} />, { wrapper: Providers });
};

export const mockAuth = (isAuthenticated: boolean) => {
  const loginMock = vi.fn();
  const logoutMock = vi.fn();

  vi.mocked(useAuth).mockReturnValue({
    user: isAuthenticated ? { email: "test@student.pwr.edu.pl" } : null,
    login: loginMock,
    logout: logoutMock,
    isAuthenticated,
  });

  return { logoutMock, loginMock };
};

export const mockNavigate = vi.fn();

vi.mock("react-router", async () => {
  const actual = await vi.importActual<typeof import("react-router")>(
    "react-router"
  );
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});
