import { AuthContext } from "@/contexts/auth-context-definition";
import { useAuth } from "@/hooks/use-auth";
import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("useAuth", () => {
  it("should return the auth context value", () => {
    const mockAuthContext = {
      user: null,
      login: () => {},
      logout: () => {},
      isAuthenticated: false,
    };
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthContext.Provider value={mockAuthContext}>
        {children}
      </AuthContext.Provider>
    );
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current).toEqual(mockAuthContext);
  });

  it("should throw an error if used outside of AuthProvider", () => {
    expect(() => renderHook(() => useAuth())).toThrow(
      "useAuth must be used within an AuthProvider"
    );
  });
});
