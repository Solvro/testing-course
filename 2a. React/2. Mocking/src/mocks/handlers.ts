import { API_BASE_URL } from '@/lib/config'
import { http, HttpResponse } from 'msw'

export const projects = [
  {
    value: "eventownik",
    label: "Eventownik"
  },
  {
    value: "topwr",
    label: "ToPWR"
  },
  {
    value: "planer",
    label: "Planer"
  },
  {
    value: "promochator",
    label: "PromoCHATor"
  },
  {
    value: "testownik",
    label: "Testownik"
  }
]

export const handlers = [
  http.get( `${API_BASE_URL}/projects`, ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('search');

    let matchingProjects = projects;

    if (search) {
      matchingProjects = projects.filter(project =>
        project.label.toLowerCase().includes(search.toLowerCase()) ||
        project.value.toLowerCase().includes(search.toLowerCase())
      );
    }

    return HttpResponse.json({
      projects: matchingProjects
    });
  }),
];