import { routes } from "@/routes";
import { render } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";

export const navigateTo = (path: string) => {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(<RouterProvider router={router} />);
};
