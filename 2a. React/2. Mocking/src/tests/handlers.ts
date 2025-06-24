import { http, HttpResponse } from "msw";
import { db } from "./db";

export const API_BASE_URL = "https://kurs-z-testowania.deno.dev";

export const handlers = [
    http.get(`${API_BASE_URL}/projects`, ({ request }) => {
        const url = new URL(request.url);
        const search = url.searchParams.get("search")?.toLowerCase();
        
        let projects = db.project.getAll();

        if (search) {
            projects = projects.filter((project) =>
                project.label.toLowerCase().includes(search)
            );
        }

        return HttpResponse.json(projects);
    })
];