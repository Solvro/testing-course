import { http, HttpResponse } from "msw";
import { db } from "./db";
import { API_BASE_URL } from "@/components/solvro-projects-combobox-api";

export const handlers = [
  http.get(`${API_BASE_URL}/projects`, ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get("search")?.toLowerCase();
    console.log(search);
    const projects = search
      ? db.project
          .getAll()
          .filter((project) => project.label.toLowerCase().includes(search))
      : db.project.getAll();

    return HttpResponse.json({ projects });
  }),
];
