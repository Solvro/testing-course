import { cleanup, render, waitFor } from "@testing-library/react";
import { OtpStep } from "./otp-step";
import {
  INVALID_OTP_MESSAGE,
  MOCK_EMAIL,
  MOCK_OTP,
} from "@/tests/mocks/constants";
import { afterEach, describe, expect, it } from "vitest";
import { Providers } from "./providers";
import userEvent from "@testing-library/user-event";
import { navigate, toastError, toastSuccess } from "@/tests/mocks/functions";
import { server } from "@/tests/mocks/server";
import { http, HttpResponse } from "msw";
import { BASE_URL } from "@/api/base-url";

function renderForm() {
  const screen = render(<OtpStep email={MOCK_EMAIL.VALID} />, {
    wrapper: Providers,
  });
  return {
    screen,
    inputOtp: screen.getByRole("textbox"),
    getSubmitButton: () => screen.getByText("Zaloguj się"),
  };
}

async function testInvalidInput(expectedErrorMessage: string) {
  const user = userEvent.setup();
  const form = renderForm();

  await user.type(form.inputOtp, MOCK_OTP.INVALID);
  const submit = form.getSubmitButton();
  await user.click(submit);

  await waitFor(() => {
    expect(toastError).toHaveBeenCalledWith(expectedErrorMessage);
  });
}

describe("OTP verification form", () => {
  afterEach(() => {
    cleanup();
  });

  it("should render the form", () => {
    const { screen } = renderForm();
    expect(screen.getByText("Hasło jednorazowe")).toBeInTheDocument();
  });

  it("should accept correct OTP input", async () => {
    const user = userEvent.setup();
    const form = renderForm();
    expect(form.inputOtp).toBeInTheDocument();

    await user.type(form.inputOtp, MOCK_OTP.VALID);
    const submit = form.getSubmitButton();
    expect(submit).toBeInTheDocument();
    expect(submit).not.toBeDisabled();
    await user.click(submit);

    await waitFor(() => {
      expect(toastSuccess).toHaveBeenCalledWith("Zalogowano pomyślnie");
      expect(navigate).toHaveBeenCalledWith("/plans");
    });
  });

  it("should reject incorrect OTP input", async () => {
    await testInvalidInput(INVALID_OTP_MESSAGE);
  });

  it("should reject incorrect OTP input with fallback message", async () => {
    server.use(
      http.post(BASE_URL + "/user/otp/verify", () =>
        HttpResponse.json({}, { status: 400 }),
      ),
    );
    await testInvalidInput("Błąd podczas logowania");
  });
});
