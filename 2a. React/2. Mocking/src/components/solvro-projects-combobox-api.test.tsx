import { render, screen, waitFor } from "@testing-library/react";
import { Providers } from "./providers";
import { SolvroProjectsComboboxApi } from "./solvro-projects-combobox-api";
import { describe, it, expect } from "vitest";
import userEvent from "@testing-library/user-event";

import { projects, PROJECTS_URL } from "@/tests/mocks/handlers";
import { server } from "@/tests/mocks/server";
import { delay, http, HttpResponse } from "msw";

const renderComponent = () => {
  render(
    <Providers>
      <SolvroProjectsComboboxApi />
    </Providers>
  );
};

describe("SolvroProjectsComboboxApi", () => {
  const user = userEvent.setup();

  it("should render a list of projects", async () => {
    renderComponent();

    const button = screen.getByRole("combobox");
    await user.click(button);

    projects.forEach((project) => {
      expect(screen.getByText(project.label)).toBeInTheDocument();
    });

    const allOptions = await screen.findAllByRole("option");
    expect(allOptions).toHaveLength(projects.length);
  });

  it("should show a message when no projects are found", async () => {
    server.use(
      // Mock an empty response
      http.get(PROJECTS_URL, () => {
        return HttpResponse.json({
          projects: [],
          total: 0,
          filters: { search: null },
        });
      })
    );
    renderComponent();
    const button = screen.getByRole("combobox");
    await user.click(button);
    expect(await screen.findByText(/nie znaleziono/i)).toBeInTheDocument();
  });

  it("should display loading state while searching a project", async () => {
    server.use(
      // Mock a delayed response
      http.get(PROJECTS_URL, async ({ request }) => {
        const searchParams = new URL(request.url).searchParams;
        if (searchParams.get("search")) {
          await delay(1000); // Simulate a delay for the search
          return HttpResponse.json({
            projects: projects.filter((project) =>
              project.label
                .toLowerCase()
                .includes(searchParams.get("search") || "")
            ),
            total: projects.length,
            filters: { search: searchParams.get("search") || null },
          });
        }
        return HttpResponse.json({
          projects: projects,
          total: projects.length,
          filters: { search: null },
        });
      })
    );
    renderComponent();
    const button = screen.getByRole("combobox");
    await user.click(button);
    const input = screen.getByPlaceholderText(/wyszukaj projekt/i);
    await user.type(input, "Axwell");
    expect(screen.getByText(/ładowanie projektów/i)).toBeInTheDocument();
  });

  it("should display error on response failure", async () => {
    server.use(
      // Mock a server error response
      http.get(PROJECTS_URL, () => {
        return HttpResponse.json(
          { error: "Failed to fetch projects" },
          { status: 500 }
        );
      })
    );

    renderComponent();

    const button = screen.getByRole("combobox");
    await user.click(button);

    expect(await screen.findByText(/błąd/i)).toBeInTheDocument();
  });
});
