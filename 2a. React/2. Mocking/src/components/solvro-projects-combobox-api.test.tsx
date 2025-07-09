import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SolvroProjectsComboboxApi } from "@/components/solvro-projects-combobox-api.tsx";
import { API_BASE_URL } from "@/components/solvro-projects-combobox-api.tsx";
import { server } from "@/tests/mocks/server";
import { http, HttpResponse } from "msw";
import { userEvent } from "@testing-library/user-event";
import { Providers } from "@/components/providers.tsx";

const clickCombobox = async () => {
  render(<SolvroProjectsComboboxApi />, { wrapper: Providers });
  const user = userEvent.setup();
  const combobox = screen.getByRole("combobox");
  expect(combobox).toBeInTheDocument();
  await user.click(combobox);
};

describe("[Combobox]", () => {
  it("should return all projects", async () => {
    const response = await fetch(`${API_BASE_URL}/projects`);
    const data = await response.json();

    expect(data).toBeDefined();
    expect(data.projects).not.toBeUndefined();
    expect(data.projects).toBeInstanceOf(Array);
    expect(data.total).not.toBeUndefined();
    expect(data.total).toBe(data.projects.length);
    expect(data.filters).not.toBeUndefined();
    expect(data.filters.search).toBeNull();
  });

  it("should render an error message when the api fails", async () => {
    server.use(
      http.get(`${API_BASE_URL}/projects`, () =>
        HttpResponse.json({}, { status: 500 })
      )
    );
    await clickCombobox();
    const error = await screen.findByText("Błąd podczas ładowania projektów");
    expect(error).toBeInTheDocument();
  });

  it("should return correct project using passed search key", async () => {
    const response = await fetch(`${API_BASE_URL}/projects?search=planer`);
    const data = await response.json();

    expect(data).toBeDefined();
    expect(data.projects).not.toBeUndefined();
    expect(data.projects).toBeInstanceOf(Array);
    expect(data.total).not.toBeUndefined();
    expect(data.total).toBe(data.projects.length);
    expect(data.filters).not.toBeUndefined();
    expect(data.filters.search).toBe("planer");

    await clickCombobox();

    const options = screen.getAllByRole("listbox");
    expect(options).toHaveLength(1);
  });
});
