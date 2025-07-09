import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, test, expect } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { SolvroProjectsComboboxApi } from './solvro-projects-combobox-api';

interface Project {
    value: string;
    label: string;
}

interface ProjectsResponse {
    projects: Project[];
    total: number;
    filters: {
        search: string | null;
    };
}

const mockProjects: Project[] = [
    { value: 'project1', label: 'Eventownik' },
    { value: 'project2', label: 'ToPWR' },
    { value: 'project3', label: 'Planer' },
    { value: 'project4', label: 'PromoCHATor' },
    { value: 'project5', label: 'Testownik' },
];

const renderWithQueryClient = (component: React.ReactNode) => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });

    return render(
        <QueryClientProvider client={queryClient}>
            {component}
        </QueryClientProvider>
    );
};

describe('SolvroProjectsComboboxApi', () => {
    test('renders component and loads projects from mocked API', async () => {
        renderWithQueryClient(<SolvroProjectsComboboxApi />);

        const comboboxTrigger = screen.getByRole('combobox');
        expect(comboboxTrigger).toBeInTheDocument();
        expect(comboboxTrigger).toHaveTextContent('Wyszukaj projekt...');

        await userEvent.click(comboboxTrigger);

        await waitFor(() => {
            expect(screen.getByText('Eventownik')).toBeInTheDocument();
        });

        expect(screen.getByText('ToPWR')).toBeInTheDocument();
        expect(screen.getByText('Planer')).toBeInTheDocument();
        expect(screen.getByText('PromoCHATor')).toBeInTheDocument();
        expect(screen.getByText('Testownik')).toBeInTheDocument();
    });

    test('shows loading state while fetching projects', async () => {
        renderWithQueryClient(<SolvroProjectsComboboxApi />);

        const comboboxTrigger = screen.getByRole('combobox');
        await userEvent.click(comboboxTrigger);

        const loadingText = screen.queryByText('Ładowanie projektów...');
        if (loadingText) {
            expect(loadingText).toBeInTheDocument();
        }

        await waitFor(() => {
            expect(screen.getByText('Eventownik')).toBeInTheDocument();
        });
    });

    test('calls API with search parameter when searching', async () => {
        let lastRequestUrl = '';
        server.use(
            http.get('https://kurs-z-testowania.deno.dev/projects', ({ request }) => {
                lastRequestUrl = request.url;
                const url = new URL(request.url);
                const search = url.searchParams.get('search');

                let filteredProjects = mockProjects;

                if (search) {
                    filteredProjects = mockProjects.filter(project =>
                        project.label.toLowerCase().includes(search.toLowerCase())
                    );
                }

                const response: ProjectsResponse = {
                    projects: filteredProjects,
                    total: filteredProjects.length,
                    filters: {
                        search: search,
                    },
                };

                return HttpResponse.json(response);
            })
        );

        renderWithQueryClient(<SolvroProjectsComboboxApi />);

        const comboboxTrigger = screen.getByRole('combobox');
        await userEvent.click(comboboxTrigger);
        await waitFor(() => {
            expect(screen.getByText('Eventownik')).toBeInTheDocument();
        });

        const searchInput = screen.getByPlaceholderText('Wyszukaj projekt...');
        await userEvent.clear(searchInput);
        await userEvent.type(searchInput, 'Eventownik');

        await waitFor(() => {
            expect(lastRequestUrl).toContain('search=Eventownik');
        });
    });

    test('selects a project', async () => {
        renderWithQueryClient(<SolvroProjectsComboboxApi />);

        const comboboxTrigger = screen.getByRole('combobox');
        await userEvent.click(comboboxTrigger);
        await waitFor(() => {
            expect(screen.getByText('Eventownik')).toBeInTheDocument();
        });

        const projectOption = screen.getByText('Eventownik');
        await userEvent.click(projectOption);

        await waitFor(() => {
            expect(comboboxTrigger).toHaveTextContent('Eventownik');
        });
    });

    test('handles API error', async () => {
        server.use(
            http.get('https://kurs-z-testowania.deno.dev/projects', () => {
                return new HttpResponse(null, { status: 500 });
            })
        );

        renderWithQueryClient(<SolvroProjectsComboboxApi />);

        const comboboxTrigger = screen.getByRole('combobox');
        await userEvent.click(comboboxTrigger);

        await waitFor(() => {
            expect(screen.getByText('Błąd podczas ładowania projektów')).toBeInTheDocument();
        });
    });

    test('shows "no projects found" message when search returns empty results', async () => {
        renderWithQueryClient(<SolvroProjectsComboboxApi />);

        const comboboxTrigger = screen.getByRole('combobox');
        await userEvent.click(comboboxTrigger);

        await waitFor(() => {
            expect(screen.getByText('Eventownik')).toBeInTheDocument();
        });

        const searchInput = screen.getByPlaceholderText('Wyszukaj projekt...');
        await userEvent.type(searchInput, 'projekt');

        await waitFor(() => {
            expect(screen.getByText('Nie znaleziono projektu.')).toBeInTheDocument();
        });
    });
});
