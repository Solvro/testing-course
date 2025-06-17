import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SolvroProjectsCombobox } from "../src/components/solvro-projects-combobox";
import userEvent from "@testing-library/user-event";

describe("solvro projects combobox", () => {
  it("should show best solvro project", async () => {
    const user = userEvent.setup();
    render(<SolvroProjectsCombobox />);
    const searchButton = screen.getByRole("combobox");
    await user.click(searchButton);
    const inputs = screen.queryAllByRole("combobox");
    await user.type(inputs[1], "pla");
    expect(screen.getByText(/planer/i)).toBeInTheDocument();
  });
});
