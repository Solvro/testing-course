import { db } from "@/tests/db";
import { server } from "@/tests/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { delay, http, HttpResponse } from "msw";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  API_BASE_URL,
  SolvroProjectsComboboxApi,
} from "./solvro-projects-combobox-api";

describe("SolvroProjectsComboboxApi", () => {
  const renderComponent = async () => {
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
    const combobox = screen.getByRole("combobox");
    const user = userEvent.setup();
    await user.click(combobox);

    return {
      combobox,
      searchBox: screen.getByPlaceholderText(/szukaj/i),
      getGroup: () => screen.findByRole("group"),
      getOptions: () => screen.findAllByRole("option"),
      user,
    };
  };
  const projectValues: number[] = [];

  beforeAll(() => {
    [1, 2, 3].forEach(() => {
      const project = db.project.create();
      projectValues.push(project.value);
    });
  });

  afterAll(() => {
    db.project.deleteMany({ where: { value: { in: projectValues } } });
  });

  it("should render combobox options when data is fetched", async () => {
    const { getOptions } = await renderComponent();
    expect((await getOptions()).length).toBeGreaterThan(0);
  });

  it("should render loading indicator while fetching data`", async () => {
    server.use(
      http.get(`${API_BASE_URL}/projects`, async () => {
        await delay(100);
        return HttpResponse.json(db.project.getAll());
      })
    );
    await renderComponent();
    expect(screen.getByText(/ładowanie/i)).toBeInTheDocument();
  });

  it("should remove loading indicator when data is fetched", async () => {
    server.use(
      http.get(`${API_BASE_URL}/projects`, async () => {
        await delay(100);
        return HttpResponse.json(db.project.getAll());
      })
    );
    await renderComponent();
    await waitForElementToBeRemoved(() => screen.getByText(/ładowanie/i));
  });

  it("should render message when error occurs during fetching data", async () => {
    server.use(
      http.get(`${API_BASE_URL}/projects`, () => HttpResponse.error())
    );

    const { user, searchBox } = await renderComponent();
    await user.type(searchBox, db.project.getAll()[0].label);

    expect(screen.getByText(/błąd/i)).toBeInTheDocument();
  });

  it.skip("should render filtered projects list after user types search term", async () => {
    const { user, searchBox, getOptions } = await renderComponent();
    const label = db.project.getAll()[0].label;

    await user.type(searchBox, label);

    expect((await getOptions()).length).toBe(1);
  });
});
