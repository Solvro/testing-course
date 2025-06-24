import { render, screen, fireEvent } from "@testing-library/react";
import { SolvroProjectsCombobox } from "./solvro-projects-combobox";

describe("SolvroProjectsCombobox", () => {
	it("renders the combobox button with placeholder", () => {
		render(<SolvroProjectsCombobox />);
		expect(screen.getByRole("combobox")).toHaveTextContent(
			"Wyszukaj projekt..."
		);
	});

	it("opens the popover when button is clicked", () => {
		render(<SolvroProjectsCombobox />);
		fireEvent.click(screen.getByRole("combobox"));
		expect(
			screen.getByPlaceholderText("Wyszukaj projekt...")
		).toBeInTheDocument();
	});

	it("shows all project options when opened", () => {
		render(<SolvroProjectsCombobox />);
		fireEvent.click(screen.getByRole("combobox"));
		expect(screen.getByText("Eventownik")).toBeInTheDocument();
		expect(screen.getByText("ToPWR")).toBeInTheDocument();
		expect(screen.getByText("Planer")).toBeInTheDocument();
		expect(screen.getByText("PromoCHATor")).toBeInTheDocument();
		expect(screen.getByText("Testownik")).toBeInTheDocument();
	});

	it("selects a project and updates the button label", () => {
		render(<SolvroProjectsCombobox />);
		fireEvent.click(screen.getByRole("combobox"));
		fireEvent.click(screen.getByText("Planer"));
		expect(screen.getByRole("combobox")).toHaveTextContent("Planer");
	});

	it("shows empty state when no project matches", () => {
		render(<SolvroProjectsCombobox />);
		fireEvent.click(screen.getByRole("combobox"));
		fireEvent.change(screen.getByPlaceholderText("Wyszukaj projekt..."), {
			target: { value: "xyz" },
		});
		expect(screen.getByText("Nie znaleziono projektu.")).toBeInTheDocument();
	});
});
