import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { SolvroProjectsCombobox } from "../src/components/solvro-projects-combobox";

describe("SolvroProjectsCombobox", () => {
  it("renders the combobox with default text", () => {
    render(<SolvroProjectsCombobox />);

    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByText("Wyszukaj projekt...")).toBeInTheDocument();
  });

  it("opens the dropdown when clicked", async () => {
    const user = userEvent.setup();
    render(<SolvroProjectsCombobox />);

    const combobox = screen.getByRole("combobox");
    await user.click(combobox);

    expect(screen.getByText("Eventownik")).toBeInTheDocument();
    expect(screen.getByText("ToPWR")).toBeInTheDocument();
    expect(screen.getByText("Planer")).toBeInTheDocument();
    expect(screen.getByText("PromoCHATor")).toBeInTheDocument();
    expect(screen.getByText("Testownik")).toBeInTheDocument();
  });

  it("selects an option when clicked", async () => {
    const user = userEvent.setup();
    render(<SolvroProjectsCombobox />);

    const combobox = screen.getByRole("combobox");
    await user.click(combobox);

    const eventownikOption = screen.getByText("Eventownik");
    await user.click(eventownikOption);

    expect(screen.getByText("Eventownik")).toBeInTheDocument();
  });

  it("shows search input when dropdown is open", async () => {
    const user = userEvent.setup();
    render(<SolvroProjectsCombobox />);

    const combobox = screen.getByRole("combobox");
    await user.click(combobox);

    const searchInput = screen.getByPlaceholderText("Wyszukaj projekt...");
    expect(searchInput).toBeInTheDocument();
  });

  it("filters options based on search input", async () => {
    const user = userEvent.setup();
    render(<SolvroProjectsCombobox />);

    const combobox = screen.getByRole("combobox");
    await user.click(combobox);

    const searchInput = screen.getByPlaceholderText("Wyszukaj projekt...");
    await user.type(searchInput, "Event");

    expect(screen.getByText("Eventownik")).toBeInTheDocument();
    expect(screen.queryByText("ToPWR")).not.toBeInTheDocument();
  });

  it('shows "Nie znaleziono projektu" when no matches found', async () => {
    const user = userEvent.setup();
    render(<SolvroProjectsCombobox />);

    const combobox = screen.getByRole("combobox");
    await user.click(combobox);

    const searchInput = screen.getByPlaceholderText("Wyszukaj projekt...");
    await user.type(searchInput, "NonExistentProject");

    expect(screen.getByText("Nie znaleziono projektu.")).toBeInTheDocument();
  });

  it("deselects option when clicking the same option again", async () => {
    const user = userEvent.setup();
    render(<SolvroProjectsCombobox />);

    const combobox = screen.getByRole("combobox");
    await user.click(combobox);

    const eventownikOption = screen.getByRole("option", {
      name: /eventownik/i,
    });
    await user.click(eventownikOption);

    expect(screen.getByRole("combobox")).toHaveTextContent("Eventownik");

    await user.click(combobox);
    const eventownikOptionAgain = screen.getByRole("option", {
      name: /eventownik/i,
    });
    await user.click(eventownikOptionAgain);

    expect(screen.getByText("Wyszukaj projekt...")).toBeInTheDocument();
  });

  it("closes dropdown after selecting an option", async () => {
    const user = userEvent.setup();
    render(<SolvroProjectsCombobox />);

    const combobox = screen.getByRole("combobox");
    await user.click(combobox);

    expect(screen.getByText("Eventownik")).toBeInTheDocument();

    const eventownikOption = screen.getByText("Eventownik");
    await user.click(eventownikOption);

    expect(screen.queryByText("ToPWR")).not.toBeInTheDocument();
    expect(screen.queryByText("Planer")).not.toBeInTheDocument();
  });
});
