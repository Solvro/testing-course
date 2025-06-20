import { render, screen } from "@testing-library/react";
import { SolvroProjectsCombobox } from "./solvro-projects-combobox";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest"; // oglądałem, wiem, że da się to zrobić w configu, ale że to pojedynczy plik, to tak jest mi prościej

describe("SolvroProjectsCombobox", () => {
  it("renders the combobox with default placeholder", () => {
    render(<SolvroProjectsCombobox />);
    const button = screen.getByRole("combobox");
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent(/szukaj/i);
  });

it("shows options when clicked", async () => {
  render(<SolvroProjectsCombobox />);
  const user = userEvent.setup();
  const button = screen.getByRole("combobox");
  await user.click(button);
  expect(screen.queryByText(/nie znaleziono/i)).not.toBeInTheDocument();

  const options = await screen.findAllByRole("option");
  expect(options.length).toBeGreaterThan(0);
});
});
