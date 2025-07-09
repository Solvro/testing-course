import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { routes } from "@/routes";

describe("Login Page", () => {
  it("should display login page", () => {
    const router = createMemoryRouter(routes, { initialEntries: ['/'] });
    render(<RouterProvider router={router} />);
    expect(screen.getByRole("heading", { name: "Zaloguj się do planera" })).toBeInTheDocument();
  });
});
