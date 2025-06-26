import { http, HttpResponse } from "msw";

export const PROJECTS_URL = "https://kurs-z-testowania.deno.dev/projects";

export const projects = [
  { value: "axwell", label: "Axwell" },
  { value: "ingrosso", label: "Sebastian Ingrosso" },
  { value: "angello", label: "Steve Angello" },
];

export const handlers = [
  http.get(PROJECTS_URL, () => {
    return HttpResponse.json({
      projects: projects,
      total: projects.length,
      filters: { search: null },
    });
  }),
];
