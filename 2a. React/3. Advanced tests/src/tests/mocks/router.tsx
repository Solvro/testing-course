import { routes } from "@/routes";
import { render } from "@testing-library/react";
import { createMemoryRouter, RouterProvider, Navigate } from "react-router";
import { vi } from "vitest";

const MockedNavigate = vi.mocked(Navigate);

export const navigateTo = (path: string) => {
  MockedNavigate.mockClear();

  const router = createMemoryRouter(routes, {
    initialEntries: [path],
  });
  render(<RouterProvider router={router} />);
};

export const mockNavigate = MockedNavigate;
