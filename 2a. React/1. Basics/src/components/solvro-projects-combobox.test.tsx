import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import userEvent from "@testing-library/user-event";
import { SolvroProjectsCombobox } from "./solvro-projects-combobox";
import "@testing-library/jest-dom";

describe("SolvroProjectsCombobox", () => {
  const renderCombobox = () => {
    render(<SolvroProjectsCombobox />);
    const combobox = screen.getByRole("combobox");
    const user = userEvent.setup();
    const getOptions = () => screen.findAllByRole("option");

    return { combobox, user, getOptions };
  };

  it("should render properly", () => {
    const { combobox } = renderCombobox();
    expect(combobox).toBeInTheDocument();
  });

  it("should display search prompt initially", () => {
    const { combobox } = renderCombobox();
    expect(combobox).toHaveTextContent(/wyszukaj/i);
  });

  it("should open dropdown when clicked", async () => {
    const { combobox, user, getOptions } = renderCombobox();

    await user.click(combobox);
    const dropdown = await screen.findByRole("dialog");
    const options = await getOptions();

    expect(dropdown).toBeInTheDocument();
    expect(options.length).toBeGreaterThan(0);
  });

  it("should select a project when clicked", async () => {
    const { combobox, user, getOptions } = renderCombobox();

    await user.click(combobox);
    const options = await getOptions();

    await user.click(options[0]);
    const selectedValue = options[0].textContent;

    expect(selectedValue).toBeDefined();
    expect(combobox).toHaveTextContent(selectedValue || "");
    expect(combobox).not.toHaveTextContent(""); // bruv
  });

  it("should filter projects based on the input", async () => {
    const { combobox, user, getOptions } = renderCombobox();
    await user.click(combobox);

    const input = screen.getByPlaceholderText(/szukaj/i);
    await user.type(input, "Eventownik");

    const options = await getOptions();

    expect(options.length).toBe(1);
    expect(options[0]).toHaveTextContent("Eventownik");
  });
});
