import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { server } from "@/mocks/server";
import { SolvroProjectsComboboxApi } from "./solvro-projects-combobox-api";
import { describe, expect, it } from "vitest";

const API_BASE_URL = "https://kurs-z-testowania.deno.dev";

// jakaś moja funkcja pomocnicza
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

describe("SolvroProjectsComboboxApi", () => {
  it("should render projects from the API", async () => {
    renderComponent();
    const trigger = screen.getByRole("combobox", {
      name: /szukaj/i,
    });
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

  it("should show a loading state initially", async () => {
    renderComponent();
    const trigger = screen.getByRole("combobox");
    await userEvent.click(trigger);
    expect(screen.getByText(/ładowanie/i)).toBeInTheDocument();
    await waitFor(() => {
        expect(screen.queryByText(/ładowanie/i)).not.toBeInTheDocument();
    });
    expect(await screen.findByText("ToPWR")).toBeInTheDocument();
  });

  it("should allow selecting a project", async () => {
    renderComponent();
    const user = userEvent.setup();

    const trigger = screen.getByRole("combobox");
    await user.click(trigger);
    const projectItem = await screen.findByText("Strona PWr Racing Team");
    await user.click(projectItem);
    const updatedTrigger = screen.getByRole("combobox", {
      name: "Strona PWr Racing Team",
    });
    expect(updatedTrigger).toBeInTheDocument();
    
    expect(screen.queryByText(/szukaj/i)).not.toBeInTheDocument();
  });
});