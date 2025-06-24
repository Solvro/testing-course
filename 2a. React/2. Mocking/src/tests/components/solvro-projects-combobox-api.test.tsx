import { it, expect, describe } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SolvroProjectsComboboxApi } from "@/components/solvro-projects-combobox-api";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "../mocks/server";

const API_BASE_URL = "https://kurs-z-testowania.deno.dev";

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("SolvroProjectsCombobox API", () => {
  const user = userEvent.setup();

  it("should render", async () => {
    render(<SolvroProjectsComboboxApi />, { wrapper: createWrapper() });

    const comboboxButton = screen.getByRole("combobox");
    await user.click(comboboxButton);

    expect(await screen.findByText("Project1Label")).toBeInTheDocument();

    const allProjects = await screen.findAllByRole("option");
    expect(allProjects).toHaveLength(2);
  });

  it("should display no project found on no projects", async () => {
    server.use(
      http.get(`${API_BASE_URL}/projects`, () => {
        return HttpResponse.json({
          projects: [],
          total: 0,
          filters: { search: null },
        });
      })
    );

    render(<SolvroProjectsComboboxApi />, { wrapper: createWrapper() });

    const comboboxButton = screen.getByRole("combobox");
    await user.click(comboboxButton);

    expect(await screen.findByText(/Nie znaleziono/i)).toBeInTheDocument();
  });

  it("should display error on error loading", async () => {
    server.use(
      http.get(`${API_BASE_URL}/projects`, () => {
        return HttpResponse.json(
          { error: "Simulated server error" },
          { status: 500 }
        );
      })
    );

    render(<SolvroProjectsComboboxApi />, { wrapper: createWrapper() });

    const comboboxButton = screen.getByRole("combobox");
    await user.click(comboboxButton);

    expect(await screen.findByText(/błąd/i)).toBeInTheDocument();
  });
});
