import type { ReactNode } from "react";
import { describe, it, expect } from "vitest";
import { Providers } from "./providers";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { SolvroProjectsComboboxApi } from "./solvro-projects-combobox-api";
import { server } from "@/tests/mocks/server";
import { errorResponseHandler, noProjectsHandler } from "@/tests/mocks/handlers";

const renderWithProviders = (children: ReactNode) => {
  render(<Providers>{children}</Providers>);
};

const renderClickCombobox = async () => {
  renderWithProviders(<SolvroProjectsComboboxApi />);
  const user = userEvent.setup();

  const combobox = screen.getByRole("combobox");
  await user.click(combobox);
};

describe("solvro-combobox", () => {
  it("Should render and display projects", async () => {
    await renderClickCombobox();

    const options = await screen.findAllByRole("option");
    expect(options.length).toBeGreaterThan(0);
  });
  it("Should render and display error message", async () => {
    server.use(errorResponseHandler);
    await renderClickCombobox();
    expect(await screen.findByText(/błąd/i)).toBeInTheDocument();
  });
  it("Should render and display no projects info", async () => {
    server.use(noProjectsHandler);
    await renderClickCombobox();
    expect(await screen.findByText(/nie znaleziono/i)).toBeInTheDocument();
  });
});
