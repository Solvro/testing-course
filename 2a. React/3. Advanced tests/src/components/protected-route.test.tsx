import { routes } from "@/routes";
import { NavigateComponent } from "@/tests/mocks/functions";
import { render } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it } from "vitest";

describe("ProtectedRoute", () => {
  it("should redirect from protected rotue if not authenticated", () => {
    const router = createMemoryRouter(routes, { initialEntries: ["/plans"] });
    render(<RouterProvider router={router} />);
    expect(NavigateComponent).toHaveBeenCalledExactlyOnceWith(
      { to: "/", replace: true },
      undefined,
    );
  });
});
