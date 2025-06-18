import { it, expect, describe } from "vitest";
import { render, screen } from "@testing-library/react";
import { SolvroProjectsCombobox } from "./solvro-projects-combobox";
import "@testing-library/jest-dom/vitest";
import userEvent from "@testing-library/user-event";

describe("SolvroProjectComboBox", () => {
  it("should render component SolvroProjectComboBox", () => {
    render(<SolvroProjectsCombobox />);

    screen.debug();

    const button = screen.getByRole("combobox");
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent(/wyszukaj projekt/i);
  });

  it("should find correct project", async () => {
    const user = userEvent.setup();

    render(<SolvroProjectsCombobox />);

    const comboboxes = screen.getAllByRole("combobox");
    await user.click(comboboxes[0]);

    const updatedComboboxes = screen.getAllByRole("combobox");
    await user.type(updatedComboboxes[2], "eve");
    expect(screen.getByText(/eventownik/i)).toBeInTheDocument();
  });
});
