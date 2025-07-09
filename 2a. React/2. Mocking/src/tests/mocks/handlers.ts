import { http, HttpResponse } from "msw";
import { API_BASE_URL } from "@/components/solvro-projects-combobox-api";

const API_PROJECTS_URL = `${API_BASE_URL}/projects`;

export const handlers = [
  http.get(API_PROJECTS_URL, () => {
    return HttpResponse.json({
      projects: [
        { value: "value1", label: "label1" },
        { value: "value2", label: "label2" },
      ],
    });
  }),
];

export const errorResponseHandler = http.get(API_PROJECTS_URL, async () => {
  return HttpResponse.error();
});

export const noProjectsHandler = http.get(API_PROJECTS_URL, async () => {
  return HttpResponse.json({ projects: [] });
});
