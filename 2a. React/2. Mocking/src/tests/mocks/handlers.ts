import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("/projects", () => {
    return HttpResponse.json({
      projects: [
        {
          value: "yeah",
          label: "Yeah",
        },
      ],
      total: 1,
      filters: {
        search: null,
      },
    });
  }),
];
