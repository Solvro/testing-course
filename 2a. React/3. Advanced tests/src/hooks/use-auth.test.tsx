import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { AuthContext } from "@/contexts/auth-context-definition";
import { useAuth } from "@/hooks/use-auth";

const mockAuthContext = {
  user: { email: "test@student.pwr.edu.pl" },
  login: vi.fn(),
  logout: vi.fn(),
  isAuthenticated: true,
};

describe("useAuth", () => {
  it("should return context when used inside AuthProvider", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthContext.Provider value={mockAuthContext}>
        {children}
      </AuthContext.Provider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current).toEqual(mockAuthContext);
  });

  it("should throw an error when used outside of provider", () => {
    expect(() => {
      renderHook(() => useAuth());
    }).toThrow("useAuth must be used within an AuthProvider");
  });
});
