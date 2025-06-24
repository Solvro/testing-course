import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SolvroProjectsComboboxApi } from "./solvro-projects-combobox-api";
import { describe, expect, it } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

function renderWithClient(ui: React.ReactElement) {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>
  );
}

describe("SolvroProjectsComboboxApi", () => {
  it("show all projects", async () => {
    renderWithClient(<SolvroProjectsComboboxApi />);

    const trigger = await screen.findByRole("combobox");
    await userEvent.click(trigger);

    const options = await screen.findAllByRole("option");
    expect(options.length).toBeGreaterThan(0);

    expect(screen.getByText("lproject1")).toBeInTheDocument();
    expect(screen.getByText("lproject4")).toBeInTheDocument();
  });
});
