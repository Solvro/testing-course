import { SolvroProjectsCombobox } from "../src/components/solvro-projects-combobox";
import { it, expect, describe } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { userEvent } from "@testing-library/user-event";

describe("solvro-projects-combobox", () => {
  const renderedCombobox = () => {
    render(<SolvroProjectsCombobox />);
    return {
      combobox: screen.getByRole("combobox"),
    };
  };

  it("should render", () => {
    const { combobox } = renderedCombobox();

    expect(combobox).toBeInTheDocument();
  });

  it("should be opened on click", async () => {
    const user = userEvent.setup();
    const { combobox } = renderedCombobox();

    expect(screen.queryByText("Eventownik")).toBeNull();

    await user.click(combobox);

    expect(screen.getByText("Eventownik")).toBeInTheDocument();
  });
});
