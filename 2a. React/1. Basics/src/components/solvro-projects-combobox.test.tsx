import { it, expect, describe } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import userEvent from "@testing-library/user-event";
import { SolvroProjectsCombobox } from "./solvro-projects-combobox";

describe("SolvroProjectsCombobox", () => {
  it("renders with default placeholder", () => {
    render(<SolvroProjectsCombobox />);

    const button = screen.getByRole("combobox");

    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent(/wyszukaj/i);
  });

  it("opens the dropdown when clicked", async () => {
    render(<SolvroProjectsCombobox />);

    const button = screen.getByRole("combobox");
    await userEvent.click(button);

    expect(await screen.findByText("Eventownik")).toBeInTheDocument();
    expect(screen.getByText("ToPWR")).toBeInTheDocument();
  });

  it("selects a project and updates the button label", async () => {
    render(<SolvroProjectsCombobox />);
    const button = screen.getByRole("combobox");
    await userEvent.click(button);

    const option = await screen.findByText("PromoCHATor");
    await userEvent.click(option);

    expect(button).toHaveTextContent("PromoCHATor");
  });

  it("filters the list based on input", async () => {
    render(<SolvroProjectsCombobox />);
    const button = screen.getByRole("combobox");
    await userEvent.click(button);

    const input = screen.getByPlaceholderText(/wyszukaj/i);
    await userEvent.type(input, "plan");

    expect(screen.getByText("Planer")).toBeInTheDocument();
    expect(screen.queryByText("Testownik")).not.toBeInTheDocument();
  });

  it("shows error message when no match found", async () => {
    render(<SolvroProjectsCombobox />);
    const button = screen.getByRole("combobox");
    await userEvent.click(button);

    const input = screen.getByPlaceholderText(/wyszukaj/i);
    await userEvent.type(input, "nieistnieje");

    expect(screen.getByText(/nie znaleziono/i)).toBeInTheDocument();
  });
});
