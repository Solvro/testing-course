import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SolvroProjectsCombobox } from "./solvro-projects-combobox";
import "@testing-library/jest-dom/vitest";
import { userEvent } from "@testing-library/user-event";

const PROJECT_NAMES = [
  "Eventownik",
  "ToPWR",
  "Planer",
  "PromoCHATor",
  "Testownik",
];

async function clickCombobox() {
  const user = userEvent.setup();
  render(<SolvroProjectsCombobox />);
  const combobox = screen.getByRole("combobox");
  expect(combobox).toBeInTheDocument();
  await user.click(combobox);
  return user;
}

describe("SolvroProjectsCombobox", () => {
  it("should render a select prompt", () => {
    render(<SolvroProjectsCombobox />);
    const combobox = screen.getByRole("combobox");
    expect(combobox).toBeInTheDocument();
    expect(combobox).toHaveTextContent(/^wyszukaj projekt/i);
  });

  it("should show all options when clicked", async () => {
    await clickCombobox();
    const list = screen.getByRole("group");
    expect(list.children).toHaveLength(PROJECT_NAMES.length);
    list.childNodes.forEach((option, index) => {
      expect(option).toHaveTextContent(PROJECT_NAMES[index]);
    });
  });

  it("should filter options based on input", async () => {
    const user = await clickCombobox();
    const input = screen.getByPlaceholderText("Wyszukaj projekt...");
    expect(input).toBeInTheDocument();
    await user.type(input, "ne");
    const list = screen.getByRole("group");
    expect(list.children).toHaveLength(2);
    expect(list.firstChild).toHaveTextContent("Planer");
    expect(list.lastChild).toHaveTextContent("Eventownik");
  });

  it("should hide the combobox when selecting an option", async () => {
    const user = await clickCombobox();
    const input = screen.getByPlaceholderText("Wyszukaj projekt...");
    expect(input).toBeInTheDocument();
    const list = screen.getByRole("group");
    expect(list).toBeInTheDocument();
    expect(list.children).toHaveLength(PROJECT_NAMES.length);
    await user.click(list.children[3]);
    expect(list).not.toBeInTheDocument();
  });
});
