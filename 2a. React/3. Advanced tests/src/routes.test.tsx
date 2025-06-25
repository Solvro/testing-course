import { routes } from "@/routes";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it } from "vitest";
import { mockIsAuthenticated } from "./tests/helpers";

function renderAndExpectHeading(route: string, heading: string) {
  const router = createMemoryRouter(routes, { initialEntries: [route] });
  render(<RouterProvider router={router} />);
  expect(screen.getByText(heading)).toBeInTheDocument();
}

describe("Router", () => {
  it("should render the index page", () => {
    renderAndExpectHeading("/", "Zaloguj się do planera");
  });

  it("should render the plans page", () => {
    mockIsAuthenticated(true);
    renderAndExpectHeading("/plans", "Planer - kocham planer");
  });
});
