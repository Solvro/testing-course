import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { SolvroProjectsCombobox } from "../src/components/solvro-projects-combobox";

describe("SolvroProjectsCombobox", () => {
  const setup = () => {
    const user = userEvent.setup();
    render(<SolvroProjectsCombobox />);

    const getCombobox = () => {
      return screen.getByRole("combobox");
    };

    return {
      user,
      combobox: getCombobox(),
    };
  };

  it("should render a combobox", () => {
    const { combobox } = setup();
    expect(combobox).toBeInTheDocument();
  });

  it("should open the listbox when clicked", async () => {
    const { combobox, user } = setup();
    await user.click(combobox);
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("should display the selected project label", async () => {
    const { combobox, user } = setup();
    await user.click(combobox);
    // get the current project options
    const projectOptions = screen.getAllByRole("option");
    expect(projectOptions.length).toBeGreaterThan(0);
    // select the first project option
    const firstProjectOption = projectOptions[0];
    await user.click(firstProjectOption);
    expect(combobox).toHaveTextContent(firstProjectOption.textContent!);
  });

  it("should filter projects based on input", async () => {
    const { combobox, user } = setup();
    await user.click(combobox);
    // get the current project options
    const projectOptions = screen.getAllByRole("option");
    expect(projectOptions.length).toBeGreaterThan(0);
    const searchInput = screen.getByPlaceholderText("Wyszukaj projekt...");
    await user.type(searchInput, projectOptions[0].textContent!);
    expect(
      screen.getByText(projectOptions[0].textContent!)
    ).toBeInTheDocument();
    expect(
      screen.queryByText(projectOptions[1].textContent!)
    ).not.toBeInTheDocument();
  });

  it("should show 'Not found' when no projects match the input", async () => {
    const { combobox, user } = setup();
    await user.click(combobox);
    const searchInput = screen.getByPlaceholderText("Wyszukaj projekt...");
    await user.type(searchInput, "nonexistentproject");
    expect(screen.getByText(/nie znaleziono/i)).toBeInTheDocument();
  });

  it("should close the listbox when clicking outside", async () => {
    const { combobox, user } = setup();
    await user.click(combobox);
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    await user.click(document.body);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
});
