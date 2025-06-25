import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { SolvroProjectsComboboxApi } from "../components/solvro-projects-combobox-api";
import { Providers } from "./providers";
import { server } from "./mocks/server";
import { http, HttpResponse } from "msw";

describe("Mocking test pls work i want to sleep", () => {
  it("should render combobox with all projects", async () => {
    const user = userEvent.setup();
    render(
      <Providers>
        <SolvroProjectsComboboxApi />
      </Providers>
    );
    screen.debug();
    const searchButton = screen.getByRole("combobox");
    await user.click(searchButton);
    expect(await screen.findByText(/juwe/i)).toBeInTheDocument();
    expect(await screen.findByText(/topwr/i)).toBeInTheDocument();
    expect(await screen.findByText(/planer/i)).toBeInTheDocument();
    expect(await screen.findByText(/testownik/i)).toBeInTheDocument();
    expect(await screen.findByText(/eventownik/i)).toBeInTheDocument();
    expect(await screen.findByText(/weekly/i)).toBeInTheDocument();
  });
  it("should filter projects ", async () => {
    const user = userEvent.setup();
    render(
      <Providers>
        <SolvroProjectsComboboxApi />
      </Providers>
    );
    const searchButton = screen.getByRole("combobox");
    await user.click(searchButton);
    const input = screen.getByPlaceholderText(/wyszukaj projekt/i);
    await user.type(input, "tes");
    expect(screen.getByText(/test/i)).toBeInTheDocument();
    expect(screen.queryByText(/juwe/i)).not.toBeInTheDocument();
  });
  it("should show information, when unable to find searched project", async () => {
    const user = userEvent.setup();
    render(
      <Providers>
        <SolvroProjectsComboboxApi />
      </Providers>
    );
    const searchButton = screen.getByRole("combobox");
    await user.click(searchButton);
    const input = screen.getByPlaceholderText(/wyszukaj projekt/i);
    await user.type(input, "gaming");
    expect(screen.getByText(/nie znal/i)).toBeInTheDocument();
  });

  it("should show error", async () => {
    const user = userEvent.setup();
    server.use(
      http.get("https://kurs-z-testowania.deno.dev/projects", () => {
        return new HttpResponse(null, {
          status: 500,
        });
      })
    );
    render(
      <Providers>
        <SolvroProjectsComboboxApi />
      </Providers>
    );
    const searchButton = screen.getByRole("combobox");
    await user.click(searchButton);
    const input = screen.getByPlaceholderText(/wyszukaj projekt/i);
    await user.type(input, "error");
    expect(screen.getByText(/błąd/i)).toBeInTheDocument();
  });
});
