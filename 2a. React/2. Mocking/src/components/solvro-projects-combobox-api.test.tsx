import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { SolvroProjectsComboboxApi } from "../components/solvro-projects-combobox-api";
import { Providers } from "./providers";

describe("SolvroProjectsComboboxApi (mocked API)", () => {
	const user = userEvent.setup();

	const getCombobox = async () => {
		render(<SolvroProjectsComboboxApi />, { wrapper: Providers });
		return {
			combobox: screen.getByRole("combobox"),
			projectList: () => screen.queryAllByRole("option"),
		};
	};

	it("shows all projects when opened", async () => {
		const { combobox } = await getCombobox();
		await user.click(combobox);

		expect(screen.getByText("ToPWR")).toBeInTheDocument();
		expect(screen.getByText("Eventownik")).toBeInTheDocument();
		expect(screen.getByText("Planer")).toBeInTheDocument();
	});

	it("filters projects by search", async () => {
		const { combobox, projectList } = await getCombobox();
		await user.click(combobox);

		const input = screen.getByPlaceholderText(/szukaj/i);
		await user.type(input, "topwr");

		expect(screen.getByText(/topwr/i)).toBeInTheDocument();
		expect(projectList()).toHaveLength(1);
	});

	it("shows 'not found' message when no projects match", async () => {
		const { combobox, projectList } = await getCombobox();
		await user.click(combobox);

		await user.type(combobox, "xyz");

		expect(projectList.length).toBe(0);
	});
});
