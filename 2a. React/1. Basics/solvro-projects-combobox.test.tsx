import { it, expect, describe } from "vitest";
import { render, screen } from "@testing-library/react";
import { SolvroProjectsCombobox } from "./../src/components/solvro-projects-combobox";
import "@testing-library/jest-dom/vitest";
import userEvent from "@testing-library/user-event";

//sorry, no time for more cases this week :(
describe("SolvroProjectsCombobox", () => {
  const filter_input = "top";
  const filtered_value = /ToPWR/i;
  const normal_value = /PromoCHATor/i;
  const search_text = /Wyszukaj/i;
  const not_found_text = /Nie znaleziono/i;
  const setupTest = () => {
    render(<SolvroProjectsCombobox />);
    return {
      combobox: screen.getByRole("combobox"),
      user: userEvent.setup(),
    };
  };

  it("should render ComboBox with initial value", async () => {
    const { combobox } = setupTest();
    expect(combobox).toBeInTheDocument();
    expect(combobox).toHaveTextContent(search_text);
    expect(screen.queryByText(normal_value)).not.toBeInTheDocument();
  });

  it("should display a list of values after clicking", async () => {
    const { combobox, user } = setupTest();
    await user.click(combobox);
    expect(combobox).toHaveAttribute("aria-expanded", "true");
    expect(await screen.findByText(filtered_value)).toBeInTheDocument();
    expect(await screen.findByText(normal_value)).toBeInTheDocument();
  });

  it("should filter displayed projects based on input", async () => {
    const { combobox, user } = setupTest();

    await user.click(combobox);
    const input = screen.getByPlaceholderText(search_text);
    await user.type(input, filter_input);

    expect(screen.getByText(filtered_value)).toBeInTheDocument();
    expect(screen.queryByText(normal_value)).not.toBeInTheDocument();
  });

  it("should display a message when no projects are matched", async () => {
    const { combobox, user } = setupTest();

    await user.click(combobox);
    const input = screen.getByPlaceholderText(search_text);

    await user.type(input, "jakisrandomshitnwm");
    expect(screen.getByText(not_found_text)).toBeInTheDocument();
    expect(screen.queryByText(filtered_value)).not.toBeInTheDocument();
    expect(screen.queryByText(normal_value)).not.toBeInTheDocument();
  });

  it("should close dropdown after selecting a project", async () => {
    const { combobox, user } = setupTest();

    await user.click(combobox);
    const option = await screen.findByText(normal_value);
    await user.click(option);
    expect(combobox).toHaveAttribute("aria-expanded", "false");
    expect(combobox).toHaveTextContent(normal_value);
  });

  it("should close dropdown after clicking outside of the list", async () => {
    const { combobox, user } = setupTest();

    await user.click(combobox);
    expect(combobox).toHaveAttribute("aria-expanded", "true");
    await user.click(document.body);
    expect(combobox).toHaveAttribute("aria-expanded", "false");
  });
});
