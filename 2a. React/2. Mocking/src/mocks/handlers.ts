import { http, HttpResponse } from 'msw';

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

export const handlers = [
    http.get('https://kurs-z-testowania.deno.dev/projects', ({ request }) => {
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
    }),
];
