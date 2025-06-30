import { http, HttpResponse } from "msw";

const PROJECTS_ENDPOINT = "https://kurs-z-testowania.deno.dev/projects";

export const handlers = [
  http.get(PROJECTS_ENDPOINT, () => {
    return HttpResponse.json({
      projects: [
        { value: "value1", label: "label1" },
        { value: "value2", label: "label2" },
      ],
    });
  }),
];

export const errorResponseHandler = http.get(PROJECTS_ENDPOINT, async () => {
  return HttpResponse.error();
});
