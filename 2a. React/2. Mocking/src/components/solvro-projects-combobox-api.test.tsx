import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { projects } from '@/mocks/handlers'
import { expect, describe, it } from 'vitest'
import { SolvroProjectsComboboxApi } from './solvro-projects-combobox-api';
import { Providers } from './providers';

describe('solvro-projects-combobox-api', async () => {

  it('should render all projects', async () => {
    render(<SolvroProjectsComboboxApi />, { wrapper: Providers });
    const user = userEvent.setup();

    await user.click(screen.getByRole('combobox'));

    for (const project of projects) {
      expect(screen.queryByText(project.label)).toBeInTheDocument();
    }
  });

  it('should render projects based on input', async () => { 
    render(<SolvroProjectsComboboxApi />, { wrapper: Providers });
    const user = userEvent.setup();

    await user.click(screen.getByRole('combobox'));
    await user.type(screen.getByPlaceholderText(/wyszukaj projekt/i), projects[0].label);

    expect(screen.queryByText(projects[0].label)).toBeInTheDocument();
    expect(screen.queryByText(projects[1].label)).not.toBeInTheDocument();
  });

});
