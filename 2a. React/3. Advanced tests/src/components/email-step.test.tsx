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
import { getLoginFormInputs } from "@/tests/helpers";

const mockedSetStep = vi.fn();

async function enterEmailAndSubmit(email: string) {
  const screen = render(
    <EmailStep setEmail={vi.fn()} setStep={mockedSetStep} />,
    { wrapper: Providers },
  );
  const user = userEvent.setup();
  const { emailInput, submitButton } = getLoginFormInputs(screen);

  await user.clear(emailInput);
  await user.type(emailInput, email);
  await user.click(submitButton);
  return screen;
}

describe("Login Page", () => {
  afterEach(() => {
    mockedSetStep.mockClear();
  });

  it("should reject invalid emails", async () => {
    const screen = await enterEmailAndSubmit(MOCK_EMAIL.INVALID);
    expect(
      screen.queryByText("Podaj poprawny adres email"),
    ).toBeInTheDocument();
  });

  it("should reject external emails", async () => {
    const screen = await enterEmailAndSubmit(MOCK_EMAIL.EXTERNAL);

    expect(
      screen.queryByText("Adres email musi kończyć się na @student.pwr.edu.pl"),
    ).toBeInTheDocument();
    expect(mockedSetStep).not.toHaveBeenCalled();
  });

  it("should accept valid internal emails", async () => {
    await enterEmailAndSubmit(MOCK_EMAIL.VALID);

    expect(mockedSetStep).toHaveBeenCalledExactlyOnceWith("otp");
  });

  it("should display error on server error", async () => {
    server.use(
      http.post(BASE_URL + "/user/otp/get", () =>
        HttpResponse.json(null, { status: 500 }),
      ),
    );

    await enterEmailAndSubmit(MOCK_EMAIL.VALID);

    expect(mockedSetStep).not.toHaveBeenCalled();
    expect(toastError).toHaveBeenCalledWith(
      "Wystąpił błąd podczas wysyłania kodu",
    );
  });
});
