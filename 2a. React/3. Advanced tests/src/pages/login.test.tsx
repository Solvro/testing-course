import { Providers } from "@/components/providers";
import { LoginPage } from "@/pages/login";
import { mockIsAuthenticated } from "@/tests/helpers";
import { NavigateComponent } from "@/tests/mocks/functions";
import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";

function renderForm() {
  const screen = render(<LoginPage />, {
    wrapper: Providers,
  });
  return {
    screen,
    emailInput: screen.findByLabelText("Adres e-mail"),
    submitButton: screen.findByRole("button"),
  };
}

describe("Login Page", () => {
  it("should render the login page", () => {
    const { screen } = renderForm();
    expect(
      screen.getByRole("heading", { name: "Zaloguj się do planera" }),
    ).toBeInTheDocument();
  });

  it("should redirect authenticated users", async () => {
    mockIsAuthenticated(true);
    expect(NavigateComponent).not.toHaveBeenCalled();
    renderForm();
    expect(NavigateComponent).toHaveBeenCalled();
  });
});
