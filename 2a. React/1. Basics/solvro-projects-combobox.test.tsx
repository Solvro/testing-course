import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import userEvent from '@testing-library/user-event';
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { SolvroProjectsCombobox } from '../src/components/solvro-projects-combobox';

describe('SolvroProjectsCombobox', () => {
  it('should display initial state with search placeholder', async () => {
    render(<SolvroProjectsCombobox />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText(/wyszukaj/i)).toBeInTheDocument();
  });

  it('should filter and display matching projects', async () => {
    const user = userEvent.setup();
    render(<SolvroProjectsCombobox />);

    const combobox = screen.getByRole('combobox');
    await user.click(combobox);

    const input = screen.getByPlaceholderText(/wyszukaj projekt/i);
    await user.type(input, 'topwr');

    expect(screen.getByText(/topwr/i)).toBeInTheDocument();
    expect(screen.queryByText(/planer/i)).not.toBeInTheDocument();
  });

  it('should handle project selection and deselection', async () => {
    const user = userEvent.setup();
    render(<SolvroProjectsCombobox />);

    const combobox = screen.getByRole('combobox');
    await user.click(combobox);

    const planerItem = screen.getByRole('option', { name: /planer/i });
    await user.click(planerItem);
    expect(combobox).toHaveTextContent(/planer/i);

    await user.click(combobox);
    const planerItemReClicked = screen.getByRole('option', { name: /planer/i });
    await user.click(planerItemReClicked);
    expect(screen.getByText('Wyszukaj projekt...')).toBeInTheDocument();
  });

  it('should show error message for non-existent project', async () => {
    const user = userEvent.setup();
    render(<SolvroProjectsCombobox />);

    const combobox = screen.getByRole('combobox');
    await user.click(combobox);

    const input = screen.getByPlaceholderText(/wyszukaj projekt/i);
    await user.type(input, 'Nieistniejacy Projekt XYZ');

    expect(screen.getByText(/nie znaleziono/i)).toBeInTheDocument();
    expect(screen.queryByText(/topwr/i)).not.toBeInTheDocument();
  });

  it('should handle empty search input correctly', async () => {
    const user = userEvent.setup();
    render(<SolvroProjectsCombobox />);

    const combobox = screen.getByRole('combobox');
    await user.click(combobox);

    const input = screen.getByPlaceholderText(/wyszukaj projekt/i);
    await user.type(input, '   ');

    // Check if the combobox is still open and shows the placeholder
    expect(
      screen.getByPlaceholderText(/wyszukaj projekt/i)
    ).toBeInTheDocument();
  });
});
