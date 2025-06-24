import { describe, it } from "vitest";
import { render } from "@testing-library/react";
import { LoginPage } from "@/pages/login";
import { Providers } from "@/components/providers";
import { userEvent } from "@testing-library/user-event";

// To jest tylko przykładowy test, żeby łatwiej wam było zacząć - możecie go usunąć lub zmodyfikować
describe("Login Page", () => {
  it("should validate my email", async () => {
    const screen = render(<LoginPage />, {
      wrapper: Providers,
    });
    const user = userEvent.setup();

    const emailInput = screen.getByLabelText("Adres e-mail");

    const submitButton = screen.getByRole("button");

    await user.type(emailInput, "invalid-email");
    await user.click(submitButton);

    // Co dalej?
    screen.debug();
  });
});
