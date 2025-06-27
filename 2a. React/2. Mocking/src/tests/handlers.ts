import { API_BASE_URL } from "@/components/solvro-projects-combobox-api";
import { db } from "./db";
import { http, HttpResponse } from "msw";

export const handlers = [
  http.get(`${API_BASE_URL}/projects`, () => {
    const allProjects = db.project.getAll();

    return HttpResponse.json({
      projects: allProjects,
      total: allProjects.length,
      filters: {
        search: null,
      },
    });
  }),
];
