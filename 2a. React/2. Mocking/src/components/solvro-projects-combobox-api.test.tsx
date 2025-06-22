import { it, expect, describe } from 'vitest'
import {render, screen} from '@testing-library/react';
import { SolvroProjectsComboboxApi } from './solvro-projects-combobox-api';
import { Providers } from './providers';
import { userEvent } from '@testing-library/user-event';
import { handlerFetchedEmpty, handlerGetError, projects } from '@/mocks/handlers';
import { server } from '@/mocks/server';

describe('solvro-projects-combobox-api', () => {

    const setupAndClick = async () => {
        render(<SolvroProjectsComboboxApi/>, {wrapper: Providers});
        const user = userEvent.setup();

        await user.click(screen.getByRole('combobox'));
        return user;
    };

    it('should render the fetched projects list', async () => {
        await setupAndClick();

        const options = screen.getAllByRole('option');
        expect(options.length).toEqual(projects.length);
        projects.forEach((project) => {
            expect(screen.getByText(project.label)).toBeInTheDocument();
          });
    });

    it('should only render matching projects when searching', async () => {
        const user = await setupAndClick();
        await user.type( screen.getByPlaceholderText(/wyszukaj/i), projects[1].label);

        const options = screen.getAllByRole('option');
        expect(options.length).toEqual(1);
        expect(screen.getByText(projects[1].label)).toBeInTheDocument();
        expect(screen.queryByText(projects[2].label)).not.toBeInTheDocument();
    });

    it('should render no project if fetched empty list', async () => {
        server.use(handlerFetchedEmpty);

        await setupAndClick();

        const options = screen.queryAllByRole('option');
        expect(options.length).toEqual(0);
        expect(screen.getByText(/nie znaleziono/i)).toBeInTheDocument();
    });

    it('should render error if fetch returned error', async () => {
        server.use(handlerGetError);

        await setupAndClick();

        const options = screen.queryAllByRole('option');
        expect(options.length).toEqual(0);
        expect(screen.getByText(/błąd/i)).toBeInTheDocument();
    });

});
