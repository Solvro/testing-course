import { Hono } from "https://deno.land/x/hono@v4.0.10/mod.ts";
import { cors } from "https://deno.land/x/hono@v4.0.10/middleware.ts";

const projects = [
  {
    value: "eventownik",
    label: "Eventownik",
  },
  {
    value: "topwr",
    label: "ToPWR",
  },
  {
    value: "planer",
    label: "Planer",
  },
  {
    value: "promochator",
    label: "PromoCHATor",
  },
  {
    value: "testownik",
    label: "Testownik",
  },
  {
    value: "plant-traits",
    label: "Plant Traits",
  },
  {
    value: "solvro-bot",
    label: "Solvro Bot",
  },
  {
    value: "juwenalia-app",
    label: "Juwenalia App",
  },
  {
    value: "umed",
    label: "Umed",
  },
  {
    value: "unite",
    label: "Strona Unite",
  },
  {
    value: "racing-team",
    label: "Strona Racing Teamu",
  },
];

const app = new Hono();

app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);

// add slowdown and error middleware
app.use("*", async (c, next) => {
  await new Promise((resolve) => setTimeout(resolve, 500 * Math.random()));

  if (Math.random() < 0.3) {
    return c.json({ error: "Simulated server error" }, 500);
  }

  return next();
});

app.get("/", (c) => {
  return c.json({
    message: "Solvro Projects API",
    version: "1.0.0",
    endpoints: {
      projects: {
        get: "/projects",
        description: "Get a list of projects with optional search filter",
        parameters: {
          search: {
            type: "string",
            description: "Search term to filter projects",
            required: false,
          },
        },
      },
    },
  });
});

app.get("/projects", async (c) => {
  const search = c.req.query("search");
  let filteredProjects = [...projects];

  if (search) {
    const searchLower = search.toLowerCase();
    filteredProjects = filteredProjects.filter(
      (project) =>
        project.label.toLowerCase().includes(searchLower) ||
        project.value.toLowerCase().includes(searchLower)
    );
  }

  return c.json({
    projects: filteredProjects,
    total: filteredProjects.length,
    filters: {
      search: search || null,
    },
  });
});

const port = 8000;
console.log(`🚀 Server running on http://localhost:${port}`);

Deno.serve({ port }, app.fetch);
