import { http, HttpResponse } from "msw";
import { faker } from "@faker-js/faker";

// const REAL_RESPONSE = {
//   projects: [
//     { value: "eventownik", label: "Eventownik" },
//     { value: "topwr", label: "ToPWR" },
//     { value: "planer", label: "Planer" },
//     { value: "promochator", label: "PromoCHATor" },
//     { value: "testownik", label: "Testownik" },
//     { value: "plant-traits", label: "Plant Traits" },
//     { value: "solvro-bot", label: "Solvro Bot" },
//     { value: "juwenalia-app", label: "Juwenalia App" },
//     { value: "umed", label: "Umed" },
//     { value: "unite", label: "Strona Unite" },
//     { value: "racing-team", label: "Strona Racing Teamu" },
//   ],
//   total: 11,
//   filters: { search: null },
// };

export const MOCK_PROJECTS = Array.from({ length: 5 }, () => ({
  value: faker.string.uuid(),
  label: faker.vehicle.vehicle(),
}));

const API_BASE_URL = "https://kurs-z-testowania.deno.dev";

export const API_PROJECTS_URL = `${API_BASE_URL}/projects`;

export const handlers = [
  http.get(API_PROJECTS_URL, () =>
    HttpResponse.json({ projects: MOCK_PROJECTS }),
  ),
];
