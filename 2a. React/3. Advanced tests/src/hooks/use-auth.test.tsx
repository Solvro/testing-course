import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useAuth } from "@/hooks/use-auth";
import { AuthProvider } from "@/contexts/auth-context";

describe("useAuth Hook", () => {
  it("throws error when used outside AuthProvider", () => {
    expect(() => {
      renderHook(() => useAuth());
    }).toThrow("useAuth must be used within an AuthProvider");
  });

  it("returns auth context when used within AuthProvider", () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(result.current).toHaveProperty("user");
    expect(result.current).toHaveProperty("login");
    expect(result.current).toHaveProperty("logout");
    expect(result.current).toHaveProperty("isAuthenticated");
    expect(typeof result.current.login).toBe("function");
    expect(typeof result.current.logout).toBe("function");
    expect(typeof result.current.isAuthenticated).toBe("boolean");
  });

  it("provides initial authentication state", () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });
});
