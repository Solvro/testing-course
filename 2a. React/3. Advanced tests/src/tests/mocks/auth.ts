import { useAuth } from "@/hooks/use-auth";
import { MOCK_EMAIL } from "./consts";
import { vi } from "vitest";

export const mockAuthState = (isAuthenticated: boolean) => {
  vi.mocked(useAuth).mockReturnValue({
    isAuthenticated,
    user: isAuthenticated ? { email: MOCK_EMAIL } : null,
    login: vi.fn(),
    logout: vi.fn(),
  });
};
