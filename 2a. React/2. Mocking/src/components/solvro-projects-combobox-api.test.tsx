import { it, expect, describe } from "vitest";
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import { SolvroProjectsComboboxApi } from "./solvro-projects-combobox-api";
import "@testing-library/jest-dom/vitest";
import { userEvent } from "@testing-library/user-event";
import { API_PROJECTS_URL, MOCK_PROJECTS } from "@/tests/mocks/handlers";
import { server } from "@/tests/mocks/server";
import { delay, http, HttpResponse } from "msw";
import { Providers } from "./providers";

function getCombobox() {
  render(
    <Providers>
      <SolvroProjectsComboboxApi />
    </Providers>,
  );
  return screen.getByRole("combobox");
}

async function clickCombobox() {
  const user = userEvent.setup();
  const combobox = getCombobox();
  expect(combobox).toBeInTheDocument();
  await user.click(combobox);
  return user;
}

const getLoader = () => screen.queryByText(/Ładowanie projektów.../i);

describe("SolvroProjectsComboboxApi", () => {
  it("should render an error message when the API fails", async () => {
    server.use(
      http.get(API_PROJECTS_URL, () => HttpResponse.json({}, { status: 500 })),
    );
    await clickCombobox();
    const list = screen.getByRole("listbox");
    expect(list).toHaveTextContent("Błąd podczas ładowania projektów");
  });

  it("should show a loading state while fetching projects", async () => {
    server.use(
      http.get(API_PROJECTS_URL, async () => {
        await delay(1000);
        return HttpResponse.json({ projects: MOCK_PROJECTS });
      }),
    );
    await clickCombobox();
    expect(screen.getByRole("listbox")).toHaveTextContent(
      "Ładowanie projektów...",
    );
    expect(getLoader()).toBeInTheDocument();
  });

  it("should remove loading state after projects are loaded", async () => {
    await clickCombobox();
    await waitForElementToBeRemoved(getLoader);
  });

  it("should render a select prompt", () => {
    const combobox = getCombobox();
    expect(combobox).toBeInTheDocument();
    expect(combobox).toHaveTextContent(/^wyszukaj projekt/i);
  });

  it("should show mocked options when clicked", async () => {
    await clickCombobox();
    const list = screen.getByRole("group");
    expect(list.children).toHaveLength(MOCK_PROJECTS.length);
    list.childNodes.forEach((option, index) => {
      expect(option).toHaveTextContent(MOCK_PROJECTS[index].label);
    });
  });

  it("should show error message on no matches", async () => {
    const user = await clickCombobox();
    const input = screen.getByPlaceholderText("Wyszukaj projekt...");
    expect(input).toBeInTheDocument();
    await user.type(input, "XXXX_X_XX_X_X--not-in-document");
    const message = screen.getByRole("presentation");
    expect(message).toBeInTheDocument();
    expect(message).toHaveTextContent("Nie znaleziono projektu.");
  });

  it("should close dialog when project clicked", async () => {
    const user = await clickCombobox();
    const list = screen.getByRole("group");
    const firstOption = list.firstElementChild;
    expect(firstOption).toHaveTextContent(MOCK_PROJECTS[0].label);
    await user.click(firstOption!);
    expect(screen.queryByRole("group")).not.toBeInTheDocument();
    await user.click(screen.getByRole("combobox"));
    expect(screen.queryByRole("group")).toBeInTheDocument();
    await user.click(screen.getByRole("group").firstElementChild!);
    expect(screen.queryByRole("group")).not.toBeInTheDocument();
  });
});
