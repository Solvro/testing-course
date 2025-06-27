import { db } from "@/tests/db";
import { TestProviders } from "@/tests/test-providers";
import { render, screen } from "@testing-library/react";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  API_BASE_URL,
  SolvroProjectsComboboxApi,
} from "./solvro-projects-combobox-api";
import userEvent from "@testing-library/user-event";
import { server } from "@/tests/server";
import { delay, http, HttpResponse } from "msw";

describe("SolvroCombobox", () => {
  const createdSlugs: string[] = [];

  beforeAll(() => {
    [1, 2, 3].forEach(() => {
      const project = db.project.create();
      createdSlugs.push(project.value);
    });
  });

  afterAll(() => {
    db.project.deleteMany({ where: { value: { in: createdSlugs } } });
  });

  const renderComponent = async () => {
    render(<SolvroProjectsComboboxApi />, { wrapper: TestProviders });

    const trigger = screen.getByRole("combobox");
    const getOption = (label: RegExp) =>
      screen.findByRole("option", { name: label });
    const getAllOptions = () => screen.getAllByRole("option");

    const user = userEvent.setup();
    await user.click(trigger);

    const searchBar = screen.getByPlaceholderText(/szukaj/i);

    return {
      trigger,
      user,
      searchBar,
      getOption,
      getAllOptions,
    };
  };

  it("should render a dropdown with a list of projects", async () => {
    await renderComponent();

    for (const slug of createdSlugs) {
      const project = db.project.findFirst({
        where: { value: { equals: slug } },
      });

      expect(
        await screen.findByText(new RegExp(project!.label))
      ).toBeInTheDocument();
    }
  });

  it("should show a loading indicator during fetch", async () => {
    server.use(
      http.get(`${API_BASE_URL}/projects`, async () => {
        await delay("infinite");
        return HttpResponse.json(null);
      })
    );

    await renderComponent();

    expect(await screen.findByText(/ładowanie/i)).toBeInTheDocument();
  });
});
