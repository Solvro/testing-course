import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { mockAuthState } from "./tests/helpers/auth-state";
import { navigateTo } from "./tests/helpers/utils";
import { MOCK_EMAIL } from "./tests/mocks/constants";

describe("Router", () => {
  it("should render the login page", () => {
    mockAuthState({
      isAuthenticated: false,
      user: null,
    });
    navigateTo("/");
    expect(screen.getByText(/zaloguj się/i)).toBeInTheDocument();
  });

  it("should render the plans page", () => {
    mockAuthState({
      isAuthenticated: true,
      user: { email: MOCK_EMAIL },
    });
    navigateTo("/plans");
    expect(screen.getByText(/kocham planer/i)).toBeInTheDocument();
  });
});
