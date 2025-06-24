import { http, HttpResponse } from "msw";

export const projects = [
    {value: "umed", label: "Umed"},
    {value: "topwr", label: "ToPWR"},
    {value: "planer", label: "Planer"},
];

const url = "https://kurs-z-testowania.deno.dev/projects";

export const handlers = [
    http.get(
    url,
    ({ request }) => {
        const search = (new URL(request.url)).searchParams.get("search")?.toLowerCase() || null;
    
        const projectsToReturn = search ? projects.filter((project) =>
          project.value.includes(search)
        ) : projects;
        
        return HttpResponse.json({
            projects: projectsToReturn
        });
    }
  ),
];

export const handlerFetchedEmpty = 
    http.get(
    url,
    async () => {
        return HttpResponse.json({
            projects: []
        });
    }
);

export const handlerGetError = 
    http.get(
    url,
    async () => {
        return HttpResponse.error();
    }
);
