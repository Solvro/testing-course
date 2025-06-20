import { it, describe, expect } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { SolvroProjectsCombobox } from "./solvro-projects-combobox";
import "@testing-library/jest-dom/vitest";
import userEvent from "@testing-library/user-event";
describe("SolvroProjectsCombobox", () => {
  it("should render", () => {
    render(<SolvroProjectsCombobox />);

    const test = screen.getByRole("combobox");

    expect(test).toBeInTheDocument();

    expect(test).toHaveTextContent(/Wyszukaj projekt.../i);
  });
  it("should show some cool projects ", async () => {
    render(<SolvroProjectsCombobox />);
    const user = userEvent.setup();
    const test = screen.getByRole("combobox");

    await user.click(test);
    expect(screen.getByText(/eventownik/i)).toBeInTheDocument();
    expect(screen.getByText(/planer/i)).toBeInTheDocument();
    expect(screen.getByText(/topwr/i)).toBeInTheDocument();
    expect(screen.getByText(/promochator/i)).toBeInTheDocument();
    expect(screen.getByText(/testownik/i)).toBeInTheDocument();
  });
  it("should fill searchbox with proper text", async () => {
    render(<SolvroProjectsCombobox />);
    const user = userEvent.setup();
    const test = screen.getByRole("combobox");

    await user.click(test);
    await user.click(screen.getByText(/eventownik/i));

    expect(test).toHaveTextContent(/eventownik/i);
  });
  it("should filter projects based on search input", async () => {
    render(<SolvroProjectsCombobox />);
    const user = userEvent.setup();
    const test = screen.getByRole("combobox");

    await user.click(test);
    const searchbar = screen.getByPlaceholderText("Wyszukaj projekt...");
    await user.type(searchbar, "p");

    expect(screen.getByText(/planer/i)).toBeInTheDocument();
    expect(screen.getByText(/topwr/i)).toBeInTheDocument();
    expect(screen.queryByText(/eventownik/i)).not.toBeInTheDocument();
  });
});
