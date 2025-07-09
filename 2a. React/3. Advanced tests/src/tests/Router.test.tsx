import { it, expect, describe, vi, beforeEach } from "vitest";
import { mockAuthState } from "./mocks/auth";
import { navigateTo, mockNavigate } from "./mocks/router";
import { screen } from "@testing-library/react";

describe("Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the login page for unauthenticated users", () => {
    mockAuthState(false);
    navigateTo("/");
    expect(screen.getByText(/zaloguj/i)).toBeInTheDocument();
  });

  it("should render the plans page for authenticated users", () => {
    mockAuthState(true);
    navigateTo("/plans");
    expect(screen.getByText(/Planer - kocham planer/i)).toBeInTheDocument();
  });

  it("should redirect to login page for unauthenticated users accessing plans", () => {
    mockAuthState(false);
    navigateTo("/plans");
    expect(mockNavigate).toHaveBeenCalledWith(
      { to: "/", replace: true },
      undefined,
    );
  });

  it("should redirect to plans page for authenticated users accessing login", () => {
    mockAuthState(true);
    navigateTo("/");
    expect(mockNavigate).toHaveBeenCalledWith(
      { to: "/plans", replace: true },
      undefined,
    );
  });
});
