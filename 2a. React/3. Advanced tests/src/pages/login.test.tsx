import { Providers } from "@/components/providers";
import { LoginPage } from "@/pages/login";
import { getLoginFormInputs, mockIsAuthenticated } from "@/tests/helpers";
import { MOCK_EMAIL } from "@/tests/mocks/constants";
import { NavigateComponent } from "@/tests/mocks/functions";
import { cleanup, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, afterEach } from "vitest";

function renderForm() {
  const screen = render(<LoginPage />, { wrapper: Providers });
  return {
    screen,
    getInputs: () => getLoginFormInputs(screen),
  };
}

describe("Login Page", () => {
  afterEach(() => {
    cleanup();
  });

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
    expect(NavigateComponent).toHaveBeenCalledExactlyOnceWith(
      { to: "/plans", replace: true },
      undefined,
    );
  });

  it("should switch to otp step on valid email", async () => {
    const user = userEvent.setup();
    const form = renderForm();
    const { emailInput, submitButton } = form.getInputs();

    await user.type(emailInput, MOCK_EMAIL.VALID);
    await user.click(submitButton);

    expect(form.screen.queryByText("Hasło jednorazowe")).toBeInTheDocument();
  });
});
