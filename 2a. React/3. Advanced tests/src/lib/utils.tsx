import { render } from "@testing-library/react";
import { clsx, type ClassValue } from "clsx";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { twMerge } from "tailwind-merge";
// import { routes } from "@/routes";
import { Providers } from "@/components/providers";
import { LoginPage } from "@/pages/login";
import { PlansPage } from "@/pages/plans";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const routes = [
  {
    path: "/",
    children: [
      { index: true, element: <LoginPage /> },
      { path: "plans", element: <PlansPage /> },
    ],
  },
];

export const navigateTo = (path: string) => {
  const router = createMemoryRouter(routes, {
    initialEntries: [path],
  });

  render(
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  );
};
