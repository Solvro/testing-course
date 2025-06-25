import { http, HttpResponse } from "msw";

const API_BASE_URL = "https://kurs-z-testowania.deno.dev";

export const handlers = [
  http.get(`${API_BASE_URL}/projects`, () => {
    return HttpResponse.json({
      projects: [
        { value: "topwr", label: "ToPWR" },
        { value: "stronapwrrt", label: "Strona PWr Racing Team" },
        { value: "solvrobot", label: "Solvro Bot" },
      ],
      total: 3,
      filters: { search: null },
    });
  }),
];