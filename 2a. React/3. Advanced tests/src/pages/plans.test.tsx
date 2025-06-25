import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PlansPage } from "./plans";
import userEvent from "@testing-library/user-event";
import { navigate } from "@/tests/mocks/functions";
import { Providers } from "@/components/providers";

describe("Plans page", () => {
  it("should navigate on log out", async () => {
    const user = userEvent.setup();
    const screen = render(<PlansPage />, { wrapper: Providers });
    const logOutButton = screen.getByRole("button", { name: "Wyloguj" });
    expect(logOutButton).toBeInTheDocument();

    await user.click(logOutButton);
    expect(navigate).toHaveBeenCalledWith("/");
  });
});
