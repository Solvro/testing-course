import { http, HttpResponse } from 'msw';

const API_BASE_URL = "https://kurs-z-testowania.deno.dev";

export const handlers = [
    http.get(`${API_BASE_URL}/projects`, () => {
        return HttpResponse.json({
            projects: [
                { value: 'fajny', label: 'Fajny' },
                { value: 'super', label: 'Super' },
                { value: 'mega', label: 'Mega' }
            ],
            total: 3,
            filters: { search: null }
        });
    })
]