import { routes } from "@/routes";
import { vi } from 'vitest';
import { render } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import { Providers } from "@/components/providers";

export const navigateTo = (path: string) => {
    const router = createMemoryRouter(routes, {
        initialEntries: [path]
    });
    render(<RouterProvider router={router}/>, {wrapper: Providers});
};

export const mockAuthState = (isAuthenticated: boolean) => {
    vi.mocked(useAuth).mockReturnValue({
        user: isAuthenticated ? {email: "111111@student.pwr.edu.pl"} : null,
        login: vi.fn(),
        logout: vi.fn(),
        isAuthenticated,
    });
};
