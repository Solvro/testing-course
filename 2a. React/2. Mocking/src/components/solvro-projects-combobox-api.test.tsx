import { API_BASE_URL } from "@/tests/handlers";
import { server } from "@/tests/server";
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import { delay, http, HttpResponse } from "msw";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { SolvroProjectsComboboxApi } from "./solvro-projects-combobox-api";
import { Providers } from "./providers";
import { db } from "@/tests/db";
import { faker } from "@faker-js/faker";
import userEvent from "@testing-library/user-event";

describe("SolvroProjectsComboboxAPI", () => {
  const projectLabels: string[] = [];

  const renderComponent = () => {
    render(<SolvroProjectsComboboxApi />, { wrapper: Providers });
    const user = userEvent.setup();
    return { user };
  };

  beforeAll(() => {
    [1, 2, 3, 4, 5].forEach(() => {
      const projectValue = faker.string.alphanumeric(8);
      const project = db.project.create({
        value: projectValue,
        label: projectValue.toUpperCase(),
      });
      projectLabels.push(project.label);
    });
  });

  afterAll(() => {
    db.project.deleteMany({ where: { label: { in: projectLabels } } });
  });

  it("should render properly", () => {
    renderComponent();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("should show loading indicator while data is being fetched", async () => {
    server.use(
      http.get(API_BASE_URL + "/projects", async () => {
        await delay(200);
        return HttpResponse.json([]);
      })
    );

    const { user } = renderComponent();
    await user.click(screen.getByRole("combobox"));
    expect(await screen.findByText(/ładowanie/i)).toBeInTheDocument();
  });

  it("should hide loading indicator after data is fetched", async () => {
    server.use(
      http.get(API_BASE_URL + "/projects", async () => {
        await delay(200);
        return HttpResponse.json([]);
      })
    );

    const { user } = renderComponent();

    await user.click(screen.getByRole("combobox"));
    await waitForElementToBeRemoved(screen.queryByText(/ładowanie/i));
  });

  it("should hide loading indicator if an error occurs", async () => {
    server.use(
      http.get(API_BASE_URL + "/projects", () => {
        return HttpResponse.json([], { status: 500 });
      })
    );

    const { user } = renderComponent();

    await user.click(screen.getByRole("combobox"));
    expect(screen.getByRole("listbox")).toHaveTextContent(/błąd/i);
  });
});
