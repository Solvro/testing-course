import LoginPage from "@/pages/login";
import { createBrowserRouter } from "react-router";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LoginPage />,
  },
]);
