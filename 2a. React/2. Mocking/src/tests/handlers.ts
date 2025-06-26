import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("/projects", () => {
    return HttpResponse.json([]);
  }),
];
