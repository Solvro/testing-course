import { it, expect, describe } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SolvroProjectsComboboxApi } from "../components/solvro-projects-combobox-api";
import { server } from "@/tests/mocks/server";
import { handlerError } from "@/tests/mocks/handlers";

//new query client for each test
const renderWithNewClient = (element: React.ReactNode) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, //for api errors
      },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>{element}</QueryClientProvider>
  );
};

describe("SolvroProjectsComboboxApi", () => {
  it("renders the list of projects from api", async () => {
    renderWithNewClient(<SolvroProjectsComboboxApi />);

    await waitFor(() =>
      expect(screen.getByText(/wyszukaj/i)).toBeInTheDocument()
    );

    const combobox = screen.getByRole("combobox");
    await userEvent.click(combobox);

    //wait for the first elem to appear
    await waitFor(() =>
      expect(screen.getByText("Eventownik")).toBeInTheDocument()
    );

    expect(screen.getByText("ToPWR")).toBeInTheDocument();
    expect(screen.getByText("Planer")).toBeInTheDocument();
  });

  it("filters projects based on user search input", async () => {
    renderWithNewClient(<SolvroProjectsComboboxApi />);

    await waitFor(() =>
      expect(screen.getByText(/wyszukaj/i)).toBeInTheDocument()
    );

    const input = screen.getByRole("combobox");
    await userEvent.type(input, "promo");

    expect(await screen.findByText("PromoCHATor")).toBeInTheDocument();
    expect(screen.queryByText("Eventownik")).not.toBeInTheDocument();
  });

  it("shows error message when api fails", async () => {
    server.use(handlerError);
    renderWithNewClient(<SolvroProjectsComboboxApi />);
    await userEvent.click(screen.getByRole("combobox"));
    expect(await screen.findByText(/błąd/i)).toBeInTheDocument();
  });
});
