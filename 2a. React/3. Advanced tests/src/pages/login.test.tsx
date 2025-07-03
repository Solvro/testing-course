import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { LoginPage } from "@/pages/login";
import { Providers } from "@/components/providers";
import { userEvent } from "@testing-library/user-event";

// To jest tylko przykładowy test, żeby łatwiej wam było zacząć - możecie go usunąć lub zmodyfikować
describe("Login Page", () => {
  it("should validate incorrect email and ask again", async () => {
    const screen = render(<LoginPage />, {
      wrapper: Providers,
    });
    const user = userEvent.setup();

    const emailInput = screen.getByLabelText("Adres e-mail");

    const submitButton = screen.getByRole("button");

    await user.type(emailInput, "invalid-email");
    await user.click(submitButton);

    // Co dalej?
    expect(await screen.findByText(/podaj poprawny/i)).toBeInTheDocument();
  });

  it("should validate correct email", async () => {
    const screen = render(<LoginPage />, {
      wrapper: Providers,
    });
    const user = userEvent.setup();

    const emailInput = screen.getByLabelText("Adres e-mail");

    const submitButton = screen.getByRole("button");

    await user.type(emailInput, "272662@student.pwr.edu.pl");
    await user.click(submitButton);

    // Co dalej?
    screen.debug();
    expect(await screen.findByText(/wyślij kod/i)).toBeInTheDocument();
  });
});
