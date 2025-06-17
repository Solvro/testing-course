import React from 'react';
import { render, screen, fireEvent, within } from './test-utils';
import { SolvroProjectsCombobox } from '../src/components/solvro-projects-combobox';
import { describe, it, expect } from 'vitest';

describe('SolvroProjectsCombobox', () => {
    it('renders the combobox with placeholder text', () => {
        render(<SolvroProjectsCombobox />);
        expect(screen.getByText('Wyszukaj projekt...')).toBeDefined();
    });

    it('opens the list of projects when clicked', () => {
        render(<SolvroProjectsCombobox />);
        fireEvent.click(screen.getByText('Wyszukaj projekt...'));
        expect(screen.getByText('Eventownik')).toBeDefined();
        expect(screen.getByText('ToPWR')).toBeDefined();
        expect(screen.getByText('Planer')).toBeDefined();
        expect(screen.getByText('PromoCHATor')).toBeDefined();
        expect(screen.getByText('Testownik')).toBeDefined();
    });

    it('filters projects based on input', () => {
        render(<SolvroProjectsCombobox />);
        fireEvent.click(screen.getByText('Wyszukaj projekt...'));
        const input = screen.getByPlaceholderText('Wyszukaj projekt...');
        fireEvent.change(input, { target: { value: 'planer' } });
        expect(screen.queryByText('Eventownik')).toBeNull();
        expect(screen.getByText('Planer')).toBeDefined();
    });

    it('selects a project and closes the combobox', () => {
        render(<SolvroProjectsCombobox />);
        fireEvent.click(screen.getByText('Wyszukaj projekt...'));
        fireEvent.click(screen.getByText('Planer'));
        expect(screen.getByText('Planer')).toBeDefined();
        expect(screen.queryByText('Eventownik')).toBeNull();
    });

    it('deselects a project', () => {
        render(<SolvroProjectsCombobox />);
        fireEvent.click(screen.getByText('Wyszukaj projekt...'));
        fireEvent.click(screen.getByText('Planer'));

        fireEvent.click(screen.getByText('Planer'));

        const listbox = screen.getByRole('listbox');
        fireEvent.click(within(listbox).getByText('Planer'));

        expect(screen.getByText('Wyszukaj projekt...')).toBeDefined();
        expect(screen.queryByText('Planer')).toBeNull();
    });
});
