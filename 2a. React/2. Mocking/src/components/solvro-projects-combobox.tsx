"use client";

import * as React from "react";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Project {
  value: string;
  label: string;
  likes?: number;
}

interface SolvroProjectsComboboxProps {
  projects?: Project[];
  isLoading?: boolean;
  error?: string | null;
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
}

const defaultFrameworks = [
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
];

export function SolvroProjectsCombobox({
  projects = defaultFrameworks,
  isLoading = false,
  error = null,
  searchTerm = "",
  onSearchChange,
  value,
  onValueChange,
}: SolvroProjectsComboboxProps & {
  value?: string;
  onValueChange?: (value: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [internalValue, setInternalValue] = React.useState("");

  const currentValue = value ?? internalValue;
  const handleValueChange = onValueChange ?? setInternalValue;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[300px] justify-between"
        >
          {currentValue
            ? (() => {
                const selectedProject = projects.find(
                  (project) => project.value === currentValue
                );
                return selectedProject
                  ? `${selectedProject.label}${
                      selectedProject.likes !== undefined
                        ? ` (${selectedProject.likes} ❤️)`
                        : ""
                    }`
                  : "Wyszukaj projekt...";
              })()
            : "Wyszukaj projekt..."}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput
            placeholder="Wyszukaj projekt..."
            value={searchTerm}
            onValueChange={onSearchChange}
          />
          <CommandList>
            {isLoading && (
              <div className="p-4 text-center text-sm text-gray-500">
                Ładowanie projektów...
              </div>
            )}
            {error && (
              <div className="p-4 text-center text-sm text-red-500">
                {error}
              </div>
            )}
            {!isLoading && !error && projects.length === 0 && (
              <CommandEmpty>Nie znaleziono projektu.</CommandEmpty>
            )}
            {!isLoading && !error && projects.length > 0 && (
              <CommandGroup>
                {projects.map((project) => (
                  <CommandItem
                    key={project.value}
                    value={project.value}
                    onSelect={(currentValue) => {
                      const newValue =
                        currentValue === currentValue ? "" : currentValue;
                      handleValueChange(newValue);
                      setOpen(false);
                    }}
                  >
                    <CheckIcon
                      className={cn(
                        "mr-2 h-4 w-4",
                        currentValue === project.value
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    <div className="flex justify-between items-center w-full">
                      <span>{project.label}</span>
                      {project.likes !== undefined && (
                        <span className="text-xs text-gray-500">
                          {project.likes} ❤️
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
