import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { mockAuthState, navigateTo, type MockedAuthState } from "./utils";

describe("Router", () => {
  it("should render the login page", () => {
    mockAuthState({
      isAuthenticated: false,
      user: null,
    } satisfies MockedAuthState);

    navigateTo("/");
    expect(screen.getByText(/zaloguj/i)).toBeInTheDocument();
  });
});
