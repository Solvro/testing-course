import { http, HttpResponse } from "msw";
import { PROJECTS } from "@/tests/mocks/data.ts";
import { API_BASE_URL } from "@/components/solvro-projects-combobox-api.tsx";

export const handlers = [
  http.get(`${API_BASE_URL}/projects`, ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get("search");

    if (search) {
      const newProjects = PROJECTS.projects.filter((project) =>
        project.value.startsWith(search)
      );

      return HttpResponse.json({
        projects: newProjects,
        total: newProjects.length,
        filters: { search },
      });
    }

    return HttpResponse.json(PROJECTS);
  }),
];
