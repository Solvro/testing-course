import { useAuth } from "@/hooks/use-auth";
import { vi } from "vitest";

const MOCK_USER = { email: "test@pwr.edu.pl" };

export function mockIsAuthenticated(isAuthenticated: boolean = false) {
  vi.mocked(useAuth).mockReturnValueOnce({
    isAuthenticated,
    user: isAuthenticated ? MOCK_USER : null,
    login: vi.fn(),
    logout: vi.fn(),
  });
}
