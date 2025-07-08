import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse, delay } from "msw";
import { server } from "@/mocks/server";
import { SolvroProjectsComboboxApi } from "./solvro-projects-combobox-api";
import { describe, expect, it } from "vitest";

const API_BASE_URL = "https://kurs-z-testowania.deno.dev";

const renderComponent = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  render(
    <QueryClientProvider client={queryClient}>
      <SolvroProjectsComboboxApi />
    </QueryClientProvider>
  );
};

const MOCK_PROJECTS = [
  { id: 1, name: "ToPWR" },
  { id: 2, name: "Strona PWr Racing Team" },
  { id: 3, name: "Solvro Bot" },
];

describe("SolvroProjectsComboboxApi", () => {
  it("should render projects from the API", async () => {
    renderComponent();
    const trigger = screen.getByRole("combobox");
    expect(trigger.textContent).toMatch(/szukaj/i);

    await userEvent.click(trigger);

    expect(await screen.findByText("ToPWR")).toBeInTheDocument();
    expect(screen.getByText("Strona PWr Racing Team")).toBeInTheDocument();
    expect(screen.getByText("Solvro Bot")).toBeInTheDocument();
  });

  it("should display an error message when the API call fails", async () => {
    server.use(
      http.get(`${API_BASE_URL}/projects`, () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    renderComponent();
    const trigger = screen.getByRole("combobox");
    await userEvent.click(trigger);

    expect(
      await screen.findByText("Błąd podczas ładowania projektów")
    ).toBeInTheDocument();
    expect(screen.queryByText("ToPWR")).not.toBeInTheDocument();
  });

  it("should first show a loading state, and then the projects from the API", async () => {
    server.use(
      http.get(new RegExp(`${API_BASE_URL}/projects.*`), async () => {
        await delay(150);
        return HttpResponse.json({
          projects: MOCK_PROJECTS.map((p) => ({
            value: p.name,
            label: p.name,
          })),
          total: MOCK_PROJECTS.length,
          filters: { search: null },
        });
      })
    );

    renderComponent();
    const user = userEvent.setup();
    const trigger = screen.getByRole("combobox");
    await user.click(trigger);

    expect(screen.getByText(/ładowanie/i)).toBeInTheDocument();

    const projectItem = await screen.findByText("ToPWR");
    expect(projectItem).toBeInTheDocument();
    expect(screen.getByText("Strona PWr Racing Team")).toBeInTheDocument();

    expect(screen.queryByText(/ładowanie/i)).not.toBeInTheDocument();
  });

  it("should allow selecting a project", async () => {
    renderComponent();
    const user = userEvent.setup();
    const trigger = screen.getByRole("combobox");
    await user.click(trigger);
    const projectItem = await screen.findByText("Strona PWr Racing Team");
    await user.click(projectItem);
    expect(trigger.textContent).toBe("Strona PWr Racing Team");
    expect(screen.queryByText(/szukaj/i)).not.toBeInTheDocument();
  });
});
