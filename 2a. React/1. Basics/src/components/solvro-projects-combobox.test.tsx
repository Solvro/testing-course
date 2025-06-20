import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SolvroProjectsCombobox } from "./solvro-projects-combobox";
import "@testing-library/jest-dom/vitest";

describe("SolvroProjectsCombobox", () => {

  class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  global.ResizeObserver = ResizeObserver;
  window.HTMLElement.prototype.scrollIntoView = function () {};


  it("opens the project list when button is clicked", async () => {
    render(<SolvroProjectsCombobox />);
    const button = screen.getByRole("combobox");
    expect(button).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(button);

    expect(screen.getByText("Eventownik")).toBeInTheDocument();
    expect(screen.getByText("ToPWR")).toBeInTheDocument();
    expect(screen.getByText("Planer")).toBeInTheDocument();
    expect(screen.getByText("PromoCHATor")).toBeInTheDocument();
    expect(screen.getByText("Testownik")).toBeInTheDocument();
  });

  it('shows only one course when typing begging of the word in the input', async () => {
    render(<SolvroProjectsCombobox />);
    const button = screen.getByRole("combobox");
    const user = userEvent.setup();
    await user.click(button);

    const input = screen.getByPlaceholderText("Wyszukaj projekt...");
    await user.type(input, "Testow");

    expect(screen.getByText("Testownik")).toBeInTheDocument();
    expect(screen.queryByText("Eventownik")).not.toBeInTheDocument();
    expect(screen.queryByText("ToPWR")).not.toBeInTheDocument();
    expect(screen.queryByText("Planer")).not.toBeInTheDocument();
    expect(screen.queryByText("PromoCHATor")).not.toBeInTheDocument();
  });
});
