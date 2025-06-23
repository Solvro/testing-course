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
}

interface SolvroProjectsComboboxProps {
  projects: Project[];
  isLoading?: boolean;
  error?: string | null;
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  value: string;
  onValueChange: (value: string) => void;
}

export function SolvroProjectsCombobox({
  projects,
  isLoading = false,
  error = null,
  searchTerm = "",
  onSearchChange,
  value,
  onValueChange,
}: SolvroProjectsComboboxProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[300px] justify-between"
        >
          {value
            ? projects.find((project) => project.value === value)?.label
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
                      onValueChange(currentValue === value ? "" : currentValue);
                      setOpen(false);
                    }}
                  >
                    <CheckIcon
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === project.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex justify-between items-center w-full">
                      <span>{project.label}</span>
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
