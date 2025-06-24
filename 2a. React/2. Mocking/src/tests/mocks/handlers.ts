import { http, HttpResponse } from "msw";

const API_BASE_URL = "https://kurs-z-testowania.deno.dev";

export const projects = [
  { value: "topwr", label: "ToPWR" },
  { value: "eventownik", label: "Eventownik" },
  { value: "planer", label: "Planer" },
];

export const handlers = [
  http.get(`${API_BASE_URL}/projects`, ({ request }) => {
    const search =
      new URL(request.url).searchParams.get("search")?.toLocaleLowerCase() ??
      null;

    const filteredProjects = search
      ? projects.filter((project) =>
          project.label.toLocaleLowerCase().includes(search),
        )
      : projects;

    return HttpResponse.json({
      projects: filteredProjects,
      total: filteredProjects.length,
      filters: {
        search: search,
      },
    });
  }),
];

export const emptyFetchHandler = http.get(`${API_BASE_URL}/projects`, () => {
  return HttpResponse.json({
    projects: [],
    total: 0,
    filters: {
      search: null,
    },
  });
});

export const errorFetchHandler = http.get(`${API_BASE_URL}/projects`, () => {
  return HttpResponse.error();
});