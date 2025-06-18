import {it, describe, expect} from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';

import { SolvroProjectsCombobox } from './solvro-projects-combobox';

describe('SolvroProjectsCombobox', () => {
  it('should render combobox on page', () => {
    render(<SolvroProjectsCombobox />);

    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText(/wyszukaj projekt/i)).toBeInTheDocument();    
  });

  it('should expand combobox', async () => {
    render(<SolvroProjectsCombobox />);
    const user = userEvent.setup();

    const combobox = screen.getByRole('combobox');
    await user.click(combobox);

    expect(combobox).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText(/eventownik/i)).toBeInTheDocument();    
  });

  it('should find project', async () => {
    render(<SolvroProjectsCombobox />);
    const user = userEvent.setup();

    const combobox = screen.getByRole('combobox');
    await user.click(combobox);

    const input = screen.getByPlaceholderText(/wyszukaj projekt/i);
    await user.type(input, 'topwr');
    expect(screen.queryByText(/topwr/i)).toBeInTheDocument();
    expect(screen.queryByText(/eventownik/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/planer/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/promochator/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/testownik/i)).not.toBeInTheDocument();
  });

  it('should select project', async () => {
    render(<SolvroProjectsCombobox />);
    const user = userEvent.setup();

    const combobox = screen.getByRole('combobox');
    await user.click(combobox);

    const topwr = screen.getByText(/topwr/i);
    await user.click(topwr);

    expect(combobox).toHaveTextContent('ToPWR');
  });
});