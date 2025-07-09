"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { SolvroProjectsCombobox } from "./solvro-projects-combobox";

export interface Project {
  value: string;
  label: string;
}

interface ProjectsResponse {
  projects: Project[];
  total: number;
  filters: {
    search: string | null;
  };
}

export const API_BASE_URL = "https://kurs-z-testowania.deno.dev";

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

export function SolvroProjectsComboboxApi() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedValue, setSelectedValue] = React.useState("");

  const {
    data: projectsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["projects", searchTerm],
    queryFn: () => fetchProjects(searchTerm || undefined),
  });

  const projects = projectsData?.projects || [];

  return (
    <SolvroProjectsCombobox
      projects={projects}
      isLoading={isLoading}
      error={error ? "Błąd podczas ładowania projektów" : null}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      value={selectedValue}
      onValueChange={setSelectedValue}
    />
  );
}
