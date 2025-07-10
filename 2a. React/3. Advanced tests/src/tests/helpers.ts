import { vi } from "vitest";
import * as useAuthModule from "@/hooks/use-auth";

export const mockUseAuth = (isAuthenticated: boolean) => {
  return vi.spyOn(useAuthModule, "useAuth").mockReturnValue({
    isAuthenticated,
    user: isAuthenticated ? { email: "272669@student.pwr.edu.pl" } : null,
    logout: vi.fn(),
    login: vi.fn(),
  });
};
