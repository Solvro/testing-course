import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Providers } from "./providers";
import { SolvroProjectsComboboxApi } from "./solvro-projects-combobox-api";
import { server } from "@/tests/mocks/server";
import { errorResponseHandler } from "@/tests/mocks/handlers";

const clickTrigger = async () => {
  render(<SolvroProjectsComboboxApi />, { wrapper: Providers });
  const user = userEvent.setup();

  await user.click(screen.getByRole("combobox"));
};

describe("SolvroProjectsComboboxApi", () => {
  it("should render all fetched projects", async () => {
    await clickTrigger();

    const options = await screen.findAllByRole("option");
    expect(options.length).toBeGreaterThan(0);

    expect(screen.getByText("label1")).toBeInTheDocument();
  });

  it("should render error message if error occured during fetching ", async () => {
    server.use(errorResponseHandler);
    await clickTrigger();

    const options = screen.queryAllByRole("option");
    expect(options.length).toEqual(0);
    expect(screen.getByText(/błąd/i)).toBeInTheDocument();
  });
});
