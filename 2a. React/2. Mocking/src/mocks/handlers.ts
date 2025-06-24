import { allProjects } from "@/components/solvro-projects-combobox-api.test";
import { http, HttpResponse } from "msw";

export const handlers = [
  http.get(
    "https://kurs-z-testowania.deno.dev/projects",
    async ({ request }) => {
      const url = new URL(request.url);
      const search = url.searchParams.get("search");

      const filteredProjects = search
        ? allProjects.filter((p) =>
            p.label.toLowerCase().includes(search.toLowerCase())
          )
        : allProjects;

      return HttpResponse.json({
        projects: filteredProjects,
        total: filteredProjects.length,
        filters: { search: search ?? null },
      });
    }
  ),
];
