import { render, screen } from "@testing-library/react";
import { SolvroProjectsCombobox } from "../src/components/solvro-projects-combobox";
import { expect } from "vitest";
import { userEvent } from "@testing-library/user-event";

const options: string[] = [
  "Eventownik",
  "ToPWR",
  "Planer",
  "PromoCHATor",
  "Testownik",
];

describe("Combobox", () => {
  it("should render a combobox with correct placeholder value", () => {
    render(<SolvroProjectsCombobox />);

    const combobox = screen.getByRole("combobox");
    expect(combobox).toBeInTheDocument();
    expect(combobox).toHaveTextContent(/Wyszukaj/i);
  });

  it("should display options on combobox click", async () => {
    render(<SolvroProjectsCombobox />);

    const combobox = screen.getByRole("combobox");
    const user = userEvent.setup();
    await user.click(combobox);

    options.forEach((option) => {
      expect(screen.getByText(option)).toBeInTheDocument();
    });
  });

  it("should update combobox label on option click with correct value", async () => {
    render(<SolvroProjectsCombobox />);

    const combobox = screen.getByRole("combobox");
    const user = userEvent.setup();
    await user.click(combobox);

    const option: string = options[3];
    const option4 = screen.getByText(option);
    await user.click(option4);

    expect(combobox).toHaveTextContent(option);
  });
});
