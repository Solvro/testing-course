import { http, HttpResponse } from "msw";

const API_URL = "https://kurs-z-testowania.deno.dev";

//stolen from api/main.ts hehe
const projects = [
  { value: "eventownik", label: "Eventownik" },
  { value: "topwr", label: "ToPWR" },
  { value: "planer", label: "Planer" },
  { value: "promochator", label: "PromoCHATor" },
  { value: "testownik", label: "Testownik" },
  { value: "plant-traits", label: "Plant Traits" },
  { value: "solvro-bot", label: "Solvro Bot" },
  { value: "juwenalia-app", label: "Juwenalia App" },
  { value: "umed", label: "Umed" },
  { value: "unite", label: "Strona Unite" },
  { value: "racing-team", label: "Strona Racing Teamu" },
];

export const handlers = [
  http.get(`${API_URL}/projects`, ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get("search");

    //some basic filtering
    const filtered_projects = projects.filter(
      (project) =>
        !search || project.label.toLowerCase().includes(search.toLowerCase())
    );

    //as expected by ProjectsResponse
    return HttpResponse.json({
      projects: filtered_projects,
      total: filtered_projects.length,
      filters: {
        search,
      },
    });
  }),
];

export const handlerError = http.get(`${API_URL}/projects`, () => {
  return HttpResponse.error();
});
