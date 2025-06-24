import { http, HttpResponse } from "msw";

const API_BASE_URL = "https://kurs-z-testowania.deno.dev";

export const handlers = [
  http.get(`${API_BASE_URL}/projects`, () => {
    return HttpResponse.json({
      projects: [
        { value: "vproject1", label: "lproject1" },
        { value: "vproject2", label: "lproject2" },
        { value: "vproject3", label: "lproject3" },
        { value: "vproject4", label: "lproject4" },
      ],
      total: 4,
      filters: { search: null },
    });
  }),
];