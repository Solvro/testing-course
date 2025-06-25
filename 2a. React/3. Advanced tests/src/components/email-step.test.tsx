import { afterEach, describe, expect, it, vi } from "vitest";
import { EmailStep } from "./email-step";
import { render } from "@testing-library/react";
import { Providers } from "./providers";
import userEvent from "@testing-library/user-event";
import { server } from "@/tests/mocks/server";
import { http, HttpResponse } from "msw";
import { BASE_URL } from "@/api/base-url";
import { toastError } from "@/tests/mocks/functions";
import { MOCK_EMAIL } from "@/tests/mocks/constants";

const mockedSetStep = vi.fn();

function renderForm() {
  const screen = render(
    <EmailStep setEmail={vi.fn()} setStep={mockedSetStep} />,
    {
      wrapper: Providers,
    },
  );
  return {
    screen,
    emailInput: screen.getByLabelText("Adres e-mail"),
    submitButton: screen.getByRole("button"),
  };
}

describe("Login Page", () => {
  afterEach(() => {
    mockedSetStep.mockClear();
  });

  it("should reject invalid emails", async () => {
    const user = userEvent.setup();
    const form = renderForm();
    await user.type(form.emailInput, MOCK_EMAIL.INVALID);
    await user.click(form.submitButton);

    expect(
      form.screen.queryByText("Podaj poprawny adres email"),
    ).toBeInTheDocument();
  });

  it("should reject external emails", async () => {
    const user = userEvent.setup();
    const form = renderForm();

    await user.clear(form.emailInput);
    await user.type(form.emailInput, MOCK_EMAIL.EXTERNAL);
    await user.click(form.submitButton);

    expect(
      form.screen.queryByText(
        "Adres email musi kończyć się na @student.pwr.edu.pl",
      ),
    ).toBeInTheDocument();
    expect(mockedSetStep).not.toHaveBeenCalled();
  });

  it("should accept valid internal emails", async () => {
    const user = userEvent.setup();
    const form = renderForm();

    await user.type(form.emailInput, MOCK_EMAIL.VALID);
    await user.click(form.submitButton);

    expect(mockedSetStep).toHaveBeenCalledExactlyOnceWith("otp");
  });

  it("should display error on server error", async () => {
    const user = userEvent.setup();
    const form = renderForm();
    server.use(
      http.post(BASE_URL + "/user/otp/get", () =>
        HttpResponse.json(null, { status: 500 }),
      ),
    );

    await user.type(form.emailInput, MOCK_EMAIL.VALID);
    await user.click(form.submitButton);

    expect(mockedSetStep).not.toHaveBeenCalled();
    expect(toastError).toHaveBeenCalledWith(
      "Wystąpił błąd podczas wysyłania kodu",
    );
  });
});
