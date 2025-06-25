import { http, HttpResponse } from "msw";

const projects = [
  {
    value: "supercoolprojekt",
    label: "Juwenalia",
  },
  {
    value: "topwr",
    label: "toPwr",
  },
  {
    value: "eventownik",
    label: "Eventownik",
  },
  {
    value: "planerownik",
    label: "Planer",
  },
  {
    value: "testownikownik",
    label: "Testownik",
  },
  {
    value: "test",
    label: "weekly",
  },
];

export const baseUrl = "https://kurs-z-testowania.deno.dev";

export const handlers = [
  http.get(`${baseUrl}/projects`, ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get("search")?.toLowerCase();

    const filteredProjects = projects.filter((project) =>
      project.label.toLowerCase().includes(search || "")
    );
    return HttpResponse.json({
      projects: filteredProjects,
      total: filteredProjects.length,
      filters: {
        search: search,
      },
    });
  }),
];
