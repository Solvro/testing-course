import { App } from "@/App";
import { ProtectedRoute } from "@/components/protected-route";
import { LoginPage } from "@/pages/login";
import { PlansPage } from "@/pages/plans";
import { type RouteObject } from "react-router";

export const routes = [
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <LoginPage />,
      },
      {
        path: "plans",
        element: (
          <ProtectedRoute>
            <PlansPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
] satisfies RouteObject[];
