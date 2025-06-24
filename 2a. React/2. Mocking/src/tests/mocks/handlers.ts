import { http, HttpResponse } from "msw";
import { API_BASE_URL } from "./api_url";

export const projects = [
  { value: "topwr", label: "ToPWR" },
  { value: "eventownik", label: "Eventownik" },
  { value: "planer", label: "Planer" },
  { value: "ledcube", label: "Led Cube" },
  { value: "juwenalia", label: "Juwenalia" },
];

export const handlers = [
  http.get(`${API_BASE_URL}/projects`, ({ request }) => {
    const search =
      new URL(request.url).searchParams.get("search")?.toLocaleLowerCase() ||
      null;

    const filteredProjects = search
      ? projects.filter((project) =>
          project.label.toLocaleLowerCase().includes(search)
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
