import { describe, it, expect } from "vitest"; // i know that it can be imported globally, but i had some issues with VSC
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SolvroProjectsCombobox } from "../src/components/solvro-projects-combobox";
import "@testing-library/jest-dom/vitest"; // same here, VSC decided not to cooperate with me

describe("SolvroProjectsCombobox", () => {
  const searchRegex = /szukaj/i;
  const topwrRegex = /topwr/i;
  const planerRegex = /planer/i;
  const notFoundRegex = /nie znaleziono/i;

  const user = userEvent.setup();

  const renderSolvroCombobox = () => {
    render(<SolvroProjectsCombobox />);

    return {
      combobox: screen.getByRole("combobox"),
      getOptions: () => screen.queryAllByRole("option"),
    };
  };

  it("should render combobox with placeholder value", () => {
    const { combobox } = renderSolvroCombobox();

    expect(combobox).toBeInTheDocument();
    expect(combobox).toHaveTextContent(searchRegex);
  });

  it("should render combobox without list", () => {
    const { combobox, getOptions } = renderSolvroCombobox();

    expect(combobox).toHaveAttribute("aria-expanded", "false");
    expect(getOptions()).toHaveLength(0);
  });

  it("should display project list on click", async () => {
    const { combobox, getOptions } = renderSolvroCombobox();

    await user.click(combobox);

    expect(combobox).toHaveAttribute("aria-expanded", "true");
    expect(getOptions().length).toBeGreaterThan(0);
    expect(screen.getByText(topwrRegex)).toBeInTheDocument();
    expect(screen.getByText(planerRegex)).toBeInTheDocument();
  });

  it("should select a project and display its label in the combobox", async () => {
    const { combobox, getOptions } = renderSolvroCombobox();

    await user.click(combobox);
    const option = screen.getByText(topwrRegex);
    await user.click(option);

    expect(combobox).toHaveTextContent(topwrRegex);
    expect(combobox).toHaveAttribute("aria-expanded", "false");
    expect(getOptions()).toHaveLength(0);
  });

  it("should clear selection when the same option is selected again", async () => {
    const { combobox } = renderSolvroCombobox();

    await user.click(combobox);
    const option = screen.getByText(topwrRegex);
    await user.click(option);

    expect(combobox).toHaveTextContent(topwrRegex);

    await user.click(combobox);
    const optionAgain = screen
      .getAllByRole("option")
      .find((opt) => opt.textContent?.match(topwrRegex));
    if (optionAgain) {
      await user.click(optionAgain);
    }

    expect(combobox).toHaveTextContent(searchRegex);
  });

  it("should filter options based on partial input", async () => {
    const { combobox } = renderSolvroCombobox();
    await user.click(combobox);

    const input = screen.getByPlaceholderText(searchRegex);
    await user.type(input, "pwr");

    expect(screen.getByText(topwrRegex)).toBeInTheDocument();
  });

  it("should filter options based on exact input", async () => {
    const { combobox, getOptions } = renderSolvroCombobox();
    await user.click(combobox);

    const input = screen.getByPlaceholderText(searchRegex);
    await user.type(input, "topwr");

    expect(screen.getByText(topwrRegex)).toBeInTheDocument();
    expect(getOptions()).toHaveLength(1);
  });

  it("should show empty state when no project matches", async () => {
    const { combobox } = renderSolvroCombobox();
    await user.click(combobox);

    const input = screen.getByPlaceholderText(searchRegex);
    await user.type(input, "elekzelekisolvrusie");

    expect(screen.getByText(notFoundRegex)).toBeInTheDocument();
  });

  it("should close the list when clicking outside", async () => {
    const { combobox, getOptions } = renderSolvroCombobox();
    await user.click(combobox);
    expect(combobox).toHaveAttribute("aria-expanded", "true");
    expect(getOptions().length).toBeGreaterThan(0);

    await user.click(document.body);

    expect(combobox).toHaveAttribute("aria-expanded", "false");
    expect(getOptions()).toHaveLength(0);
  });

  it("should close the list when pressing escape", async () => {
    const { combobox, getOptions } = renderSolvroCombobox();
    await user.click(combobox);
    expect(combobox).toHaveAttribute("aria-expanded", "true");
    expect(getOptions().length).toBeGreaterThan(0);

    await user.keyboard("{Escape}");

    expect(combobox).toHaveAttribute("aria-expanded", "false");
    expect(getOptions()).toHaveLength(0);
  });
});
