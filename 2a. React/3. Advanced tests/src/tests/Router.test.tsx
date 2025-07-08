import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { mockAuthState } from "./utils/auth";
import { navigateTo } from "./utils/router";
import { MOCK_EMAIL } from "./utils/constants";

describe("Router", () => {
  it("should render the login page", () => {
    mockAuthState({
      isAuthenticated: false,
      user: null,
    });
    navigateTo("/");
    expect(screen.getByText(/zaloguj/i)).toBeInTheDocument();
  });

  it("should render the plans page", () => {
    mockAuthState({
      isAuthenticated: true,
      user: { email: MOCK_EMAIL },
    });
    navigateTo("/plans");
    expect(screen.getByText(/planer/i)).toBeInTheDocument();
  });
});
