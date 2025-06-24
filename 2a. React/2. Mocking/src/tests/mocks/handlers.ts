import { http, HttpResponse } from "msw";

const API_BASE_URL = "https://kurs-z-testowania.deno.dev";

export const handlers = [
  http.get(`${API_BASE_URL}/projects`, () => {
    return HttpResponse.json({
      projects: [
        { value: "project1", label: "Project1Label" },
        { value: "there", label: "Hello" },
      ],
      total: 2,
      filters: { search: null },
    });
  }),
];
