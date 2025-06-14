import React from 'react';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { SolvroProjectsCombobox } from '../src/components/solvro-projects-combobox';


describe('SolvroProjectsCombobox', () => {

    const renderCombobox =() => {
        render(<SolvroProjectsCombobox />);
        return {
            combobox: screen.getByRole('combobox')
        };
    };

    it('should render a comobox with a placeholder', () => {
        const { combobox } = renderCombobox();

        expect(combobox).toBeInTheDocument();
        expect(combobox).toHaveTextContent(/wyszukaj/i);
    });

    it('should display a search field and a list of projects on expand', async () => {
        const { combobox } = renderCombobox();
        const user = userEvent.setup();

        await user.click(combobox);

        expect(combobox).toHaveAttribute('aria-expanded', 'true');
        const searchInput =  screen.getByPlaceholderText(/wyszukaj/i);
        expect(searchInput).toBeInTheDocument();
        const options = screen.getAllByRole('option');
        expect(options.length).toBeGreaterThan(0);
        expect(screen.queryByText(/eventownik/i)).toBeInTheDocument();
    });

    it('should filter by search input', async () => {
        const { combobox } = renderCombobox();

        await userEvent.click(combobox);
        await userEvent.type(
            screen.getByPlaceholderText(/wyszukaj/i), 'planer');

        expect(screen.getByText(/planer/i)).toBeInTheDocument();
        expect(screen.queryByText(/eventownik/i)).not.toBeInTheDocument();
    });

    it('should close dropdown on project select', async () => {
        const { combobox } = renderCombobox();

        await userEvent.click(combobox);
        await userEvent.click(screen.getByText(/planer/i));

        expect(combobox).toHaveTextContent(/planer/i);
        expect(combobox).toHaveAttribute('aria-expanded', 'false');
    });

});
