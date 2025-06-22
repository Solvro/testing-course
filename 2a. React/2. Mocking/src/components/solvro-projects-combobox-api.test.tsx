import AllProviders from "@/tests/AllProviders";
import "@testing-library/jest-dom/vitest";
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { SolvroProjectsComboboxApi } from "../components/solvro-projects-combobox-api";
import { emptyFetchHandler, errorFetchHandler } from "@/tests/mocks/handlers";
import { server } from "@/tests/mocks/server";

describe('SolvroProjectsComboboxApi', async () => {
    const searchRegex = /szukaj/i;
    const topwrRegex = /topwr/i;
    const notFoundRegex = /nie znaleziono/i;
    const errorRegex = /błąd/i;

    const user = userEvent.setup();

    const getCombobox = async () => {
        render(<SolvroProjectsComboboxApi />, { wrapper: AllProviders });

        return {
            combobox: screen.getByRole("combobox"),
            projectList: () => screen.queryAllByRole("option"),
        }
    }

    it('should render the list of projects', async () => {
        const { combobox, projectList } = await getCombobox();

        await user.click(combobox);

        expect(combobox).toHaveAttribute("aria-expanded", "true");
        expect(projectList().length).toBeGreaterThan(0);
    })

    it('should filter projects based on search input', async () => {
        const { combobox, projectList } = await getCombobox();
        
        await user.click(combobox);
        const input = screen.getByPlaceholderText(searchRegex);
        await user.type(input, "topwr");

        expect(screen.getByText(topwrRegex)).toBeInTheDocument();
        expect(projectList()).toHaveLength(1);
    });

    it('should handle empty search results', async () => {
        server.use(emptyFetchHandler);
        const { combobox, projectList } = await getCombobox();

        await user.click(combobox);

        expect(combobox).toHaveAttribute("aria-expanded", "true");
        expect(projectList().length).toEqual(0);
        expect(screen.getByText(notFoundRegex)).toBeInTheDocument();
    });

    it('should handle API errors gracefully', async () => {
        server.use(errorFetchHandler);
        const { combobox, projectList } = await getCombobox();

        await user.click(combobox);

        expect(combobox).toHaveAttribute("aria-expanded", "true");
        expect(projectList().length).toEqual(0);
        expect(screen.getByText(errorRegex)).toBeInTheDocument();
    });
});
