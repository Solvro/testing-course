import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { mockAuth, navigateTo } from "./utils";

describe("Application Router", () => {
  it("should render login page at /", () => {
    mockAuth(false);
    navigateTo("/");

    expect(screen.getByText(/zaloguj się/i)).toBeInTheDocument();
  });

  it("should redirect back to login page when unauthenticated access to /plans", () => {
    mockAuth(false);
    navigateTo("/plans");

    expect(screen.getByText(/zaloguj się/i)).toBeInTheDocument();
  });

  it("should render plans page when authenticated", () => {
    mockAuth(true);
    navigateTo("/plans");

    expect(screen.getByText(/wyloguj/i)).toBeInTheDocument();
  });
});
