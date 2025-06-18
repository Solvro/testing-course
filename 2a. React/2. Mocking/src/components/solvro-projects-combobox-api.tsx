"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SolvroProjectsCombobox } from "./solvro-projects-combobox";
import { Button } from "@/components/ui/button";

interface Project {
  value: string;
  label: string;
  likes: number;
}

interface ProjectsResponse {
  projects: Project[];
  total: number;
  filters: {
    search: string | null;
  };
}

const API_BASE_URL = "https://kurs-z-testowania.deno.dev";

const fetchProjects = async (search?: string): Promise<ProjectsResponse> => {
  const url = new URL(`${API_BASE_URL}/projects`);
  if (search) {
    url.searchParams.append("search", search);
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error("Failed to fetch projects");
  }

  return response.json();
};

const likeProject = async (
  projectValue: string
): Promise<{ message: string; likes: number }> => {
  const response = await fetch(
    `${API_BASE_URL}/projects/${projectValue}/like`,
    {
      method: "POST",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to like project");
  }

  return response.json();
};

export function SolvroProjectsComboboxApi() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedValue, setSelectedValue] = React.useState("");

  const queryClient = useQueryClient();

  const {
    data: projectsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["projects", searchTerm],
    queryFn: () => fetchProjects(searchTerm || undefined),
  });

  const likeMutation = useMutation({
    mutationFn: likeProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  const projects = projectsData?.projects || [];
  const selectedProject = projects.find(
    (project) => project.value === selectedValue
  );

  const handleLikeProject = () => {
    if (selectedProject) {
      likeMutation.mutate(selectedProject.value);
    }
  };

  return (
    <div className="space-y-4">
      <SolvroProjectsCombobox
        projects={projects}
        isLoading={isLoading}
        error={error ? "Błąd podczas ładowania projektów" : null}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        value={selectedValue}
        onValueChange={setSelectedValue}
      />

      {selectedProject && (
        <div className="flex items-center gap-2">
          <Button
            onClick={handleLikeProject}
            disabled={likeMutation.isPending}
            variant="outline"
            size="sm"
          >
            {likeMutation.isPending ? "Dodawanie..." : "👍 Polub projekt"}
          </Button>
          <span className="text-sm text-gray-600">
            Aktualnie polubień: {selectedProject.likes}
          </span>
        </div>
      )}
    </div>
  );
}
