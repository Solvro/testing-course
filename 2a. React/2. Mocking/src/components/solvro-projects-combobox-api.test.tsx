import { it, expect, describe } from 'vitest';
import { SolvroProjectsComboboxApi } from '@/components/solvro-projects-combobox-api';
import { render, screen } from '@testing-library/react';
import { server } from '@/tests/mocks/server';
import { http, HttpResponse } from 'msw';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import userEvent from '@testing-library/user-event';

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });
    
    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
};

describe('SolvroComboxApi', () => {

    const user = userEvent.setup();

    it('should display projects', async () => {
        render(<SolvroProjectsComboboxApi />, { wrapper: createWrapper() });

        const comboboxButton = screen.getByRole('combobox');
        await user.click(comboboxButton);

        const fajnyProject = await screen.findByText('Fajny');
        expect(fajnyProject).toBeInTheDocument();
        
        const allProjects = await screen.findAllByRole('option');
        expect(allProjects).toHaveLength(3);
    })

    it('should display no projects and info', async () => {
        server.use(
            http.get('https://kurs-z-testowania.deno.dev/projects', () => {
                return HttpResponse.json({
                    projects: [],
                    total: 0,
                    filters: { search: null }
                });
            })
        );

        render(<SolvroProjectsComboboxApi />, { wrapper: createWrapper() });

        const comboboxButton = screen.getByRole('combobox');
        user.click(comboboxButton);

        const noProjectsMessage = await screen.findByText(/Nie znaleziono/);

        expect(noProjectsMessage).toBeInTheDocument();
        const allProjects = screen.queryAllByRole('option');
        expect(allProjects).toHaveLength(0);
    })

    it('should display loading message when fetching projects', async () => {
        server.use(
            http.get('https://kurs-z-testowania.deno.dev/projects', async () => {
                await new Promise(resolve => setTimeout(resolve, 100));
                return HttpResponse.json({
                    projects: [{ value: 'test', label: 'Test' }],
                    total: 1,
                    filters: { search: null }
                });
            })
        );

        render(<SolvroProjectsComboboxApi />, { wrapper: createWrapper() });

        const comboboxButton = screen.getByRole('combobox');
        await user.click(comboboxButton);

        const loadingMessage = await screen.findByText(/Ładowanie projektów/);
        expect(loadingMessage).toBeInTheDocument();
    })
})
