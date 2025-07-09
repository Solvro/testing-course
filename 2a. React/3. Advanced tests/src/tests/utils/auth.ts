import { useAuth } from "@/hooks/use-auth";
import { vi } from "vitest";

type AuthState = {
  isAuthenticated: boolean;
  user: { email: string } | null;
};

export const mockAuthState = (authState: AuthState) => {
  vi.mocked(useAuth).mockReturnValue({
    ...authState,
    login: vi.fn(),
    logout: vi.fn(),
  });
};
