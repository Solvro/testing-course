import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import userEvent from "@testing-library/user-event";
import { SolvroProjectsCombobox } from "../src/components/solvro-projects-combobox";

describe("SolvroProjectsCombobox", () => {
  it("should render combobox with default text placeholder", async () => {
    render(<SolvroProjectsCombobox />);
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByText(/wyszukaj/i)).toBeInTheDocument();
  });

  it("should open the combobox when clicked", async () => {
    const user = userEvent.setup();
    render(<SolvroProjectsCombobox />);
    const combobox = screen.getByRole("combobox");
    await user.click(combobox);
    expect(screen.getByText(/planer/i)).toBeInTheDocument();
  });

  it("should select a project when item is clicked", async () => {
    const user = userEvent.setup();
    render(<SolvroProjectsCombobox />);
    const combobox = screen.getByRole("combobox");
    await user.click(combobox);
    const input = screen.getByPlaceholderText(/wyszukaj projekt/i);
    await user.type(input, "planer");
    const projectItem = screen.getByText(/planer/i);
    await user.click(projectItem);
    expect(combobox).toHaveTextContent(/planer/i);
  });

  it("should deselect a project when the same item is clicked again", async () => {
    const user = userEvent.setup();
    render(<SolvroProjectsCombobox />);

    const combobox = screen.getByRole("combobox");
    await user.click(combobox);

    const planerDropdownItem = screen.getByRole("option", {
      name: /planer/i,
    });
    await user.click(planerDropdownItem);

    expect(screen.getByRole("combobox")).toHaveTextContent(/planer/i);

    await user.click(combobox);
    const planerDropdownItemReClicked = screen.getByRole("option", {
      name: /planer/i,
    });
    await user.click(planerDropdownItemReClicked);

    expect(screen.getByText("Wyszukaj projekt...")).toBeInTheDocument();
  });

  it("should filter projects based on input", async () => {
    const user = userEvent.setup();
    render(<SolvroProjectsCombobox />);
    const combobox = screen.getByRole("combobox");
    await user.click(combobox);
    const input = screen.getByPlaceholderText(/wyszukaj projekt/i);
    await user.type(input, "planer");
    expect(screen.getByText(/planer/i)).toBeInTheDocument();
    expect(screen.queryByText(/topwr/i)).not.toBeInTheDocument();
  });

  it("should show error message when no matches found", async () => {
    const user = userEvent.setup();
    render(<SolvroProjectsCombobox />);
    const combobox = screen.getByRole("combobox");
    await user.click(combobox);
    const input = screen.getByPlaceholderText(/wyszukaj projekt/i);
    await user.type(input, "WKS Slask Wroclaw");
    expect(screen.getByText(/nie znaleziono/i)).toBeInTheDocument();
    expect(screen.queryByText(/planer/i)).not.toBeInTheDocument();
  });
});
