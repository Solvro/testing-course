import { Outlet } from "react-router";

export const Layout = () => {
  return (
    <main className="p-5">
      <Outlet />
    </main>
  );
};
