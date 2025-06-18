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
];

const app = new Hono();

app.use(
  "*",
  cors({
    origin: "*",
  })
);

// add slowdown middleware
app.use("*", async (_c, next) => {
  // Simulate a delay for demonstration purposes
  await new Promise((resolve) => setTimeout(resolve, 500 * Math.random()));
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
      likeProject: {
        post: "/projects/:value/like",
        description: "Like a project by its value",
        parameters: {
          value: {
            type: "string",
            description: "The value of the project to like",
            required: true,
          },
        },
      },
    },
  });
});

const getKey = (value: string) => {
  return ["projects", value, "likes"];
};

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
  const kv = await Deno.openKv();

  const projectLikes = await kv.getMany(
    filteredProjects.map((project) => getKey(project.value))
  );

  const projectsWithLikes = filteredProjects.map((project) => {
    const likeCount = projectLikes.find(
      (like) => like.key[1] === project.value
    );

    return {
      ...project,
      likes: likeCount?.value ? likeCount.value : 0,
    };
  });

  return c.json({
    projects: projectsWithLikes,
    total: projectsWithLikes.length,
    filters: {
      search: search || null,
    },
  });
});

app.post("/projects/:value/like", async (c) => {
  const kv = await Deno.openKv();
  const value = c.req.param("value");
  const project = projects.find((p) => p.value === value);

  if (!project) {
    return c.json({ error: "Project not found" }, 404);
  }

  const key = getKey(project.value);
  const likeCount = await kv.get<number>(key);

  if (likeCount.value === null) {
    await kv.set(key, 1);
  } else {
    await kv.set(key, likeCount.value + 1);
  }

  return c.json({
    message: `Project ${project.label} liked successfully`,
    likes: likeCount.value === null ? 1 : likeCount.value + 1,
  });
});

const port = 8000;
console.log(`🚀 Server running on http://localhost:${port}`);

Deno.serve({ port }, app.fetch);
