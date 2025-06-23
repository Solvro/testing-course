import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { projects } from "../tests/mocks/handlers";
import { expect, describe, it, beforeEach } from "vitest";
import { SolvroProjectsComboboxApi } from "./solvro-projects-combobox-api";
import { Providers } from "./providers";

describe("SolvroProjectsComboboxAPI", async () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    render(<SolvroProjectsComboboxApi />, { wrapper: Providers });
    user = userEvent.setup();
  });
  
  it("should render all projects", async () => {
    await user.click(screen.getByRole("combobox"));

    for (const project of projects) {
      expect(screen.queryByText(project.label)).toBeInTheDocument();
    }
  });

  it("should render searched projects", async () => {
    await user.click(screen.getByRole("combobox"));
    await user.type(
      screen.getByPlaceholderText(/wyszukaj projekt/i),
      projects[1].label
    );

    expect(screen.queryByText(projects[1].label)).toBeInTheDocument();
  });
});
