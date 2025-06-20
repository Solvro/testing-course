import { SolvroProjectsCombobox } from "./solvro-projects-combobox";
import { it, expect, describe } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { userEvent } from "@testing-library/user-event";

describe("SolvroProjectsCombobox", () => {
  it("shows CommandEmpty when no project for the input", async () => {
    render(<SolvroProjectsCombobox />);
    const triggerButton = screen.getByRole("combobox");

    await userEvent.click(triggerButton);

    const input = screen.getByPlaceholderText("Wyszukaj projekt...");
    await userEvent.type(input, "jakiesgownocogoniema");

    await waitFor(() => {
      expect(
        screen.getByText("Nie znaleziono projektu.")
      ).toBeInTheDocument();
    });
  });
});