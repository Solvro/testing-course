import { simulateDelay, simulateError } from "@/lib/utils";
import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Providers } from "./providers";
import { SolvroProjectsComboboxApi } from "./solvro-projects-combobox-api";

export const API_BASE_URL = "https://kurs-z-testowania.deno.dev";

export const allProjects = [
  { value: "1", label: "project 1" },
  { value: "2", label: "project 2" },
];

const setup = () => {
  const user = userEvent.setup();
  render(<SolvroProjectsComboboxApi />, { wrapper: Providers });

  const openCombobox = async () => {
    await user.click(screen.getByRole("combobox"));
  };

  const searchFor = async (text: string) => {
    const input = screen.getByPlaceholderText(/projekt/i);
    await user.clear(input);
    await user.type(input, text);
  };

  return {
    openCombobox,
    searchFor,
  };
};

describe("SolvroProjectsComboboxApi", async () => {
  it("should render", async () => {
    const { openCombobox } = setup();
    await openCombobox();

    expect(screen.getAllByRole("combobox")[0]).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(allProjects[0].label)).toBeInTheDocument();
      expect(screen.getByText(allProjects[1].label)).toBeInTheDocument();
    });
  });

  it("should show a loading state when fetching projects", async () => {
    simulateDelay(`${API_BASE_URL}/projects`);
    const { openCombobox, searchFor } = setup();

    await openCombobox();
    await searchFor("test");

    expect(screen.getByText(/ładowanie/i)).toBeInTheDocument();
  });

  it("should remove loading state when projects are fetched", async () => {
    simulateDelay(`${API_BASE_URL}/projects`);
    const { openCombobox, searchFor } = setup();

    await openCombobox();
    // either setup clearing the cache of query client or search for different term
    // if we search for the term in cache it will not fetch data from api and won't show loading at all bruh
    await searchFor("test-2");

    await waitForElementToBeRemoved(() => screen.queryByText(/ładowanie/i));
  });

  it("should display error if fetch fails", async () => {
    simulateError(`${API_BASE_URL}/projects`);
    const { openCombobox, searchFor } = setup();

    await openCombobox();
    await searchFor("to");

    expect(screen.getByText(/błąd/i)).toBeInTheDocument();
  });

  it("should display empty message if no projects found", async () => {
    const { openCombobox, searchFor } = setup();

    await openCombobox();
    await searchFor("nonexistant");

    expect(screen.getByText(/nie znaleziono/i)).toBeInTheDocument();
  });

  it("should filter projects", async () => {
    const { openCombobox, searchFor } = setup();

    await openCombobox();
    await searchFor(allProjects[0].value);

    expect(screen.getByText(allProjects[0].label)).toBeInTheDocument();
    expect(screen.queryByText(allProjects[1].label)).not.toBeInTheDocument();
  });
});
