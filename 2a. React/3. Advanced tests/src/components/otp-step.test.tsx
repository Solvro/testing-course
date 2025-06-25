import { render } from "@testing-library/react";
import { OtpStep } from "./otp-step";
import { MOCK_EMAIL } from "@/tests/mocks/constants";
import { describe, expect, it } from "vitest";
import { Providers } from "./providers";

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

// vi.mock("input-otp", async (importOriginal) => {
//   const original = await importOriginal<typeof import("input-otp")>();
//   return {
//     ...original,
//     OTPInput: vi.fn((props) => (
//       <original.OTPInput {...props}></original.OTPInput>
//     )),
//   };
// });

describe("OTP verification form", () => {
  it("should render the form", () => {
    const { screen } = renderForm();
    expect(screen.getByText("Hasło jednorazowe")).toBeInTheDocument();
  });

  // it("should accept correct OTP input", async () => {
  //   const user = userEvent.setup();
  //   const form = renderForm();
  //   expect(form.inputOtp).toBeInTheDocument();

  //   await user.type(form.inputOtp, MOCK_OTP);
  //   await user.click(form.getSubmitButton());

  //   // await waitFor(() => {
  //   //   expect(form.getSubmitButton()).toBeDisabled();
  //   // });
  //   // await waitFor(() => {
  //   //   expect(form.getSubmitButton()).not.toBeDisabled();
  //   // });
  //   // expect(toastSuccess).toHaveBeenCalledWith("Zalogowano pomyślnie");
  //   // expect(navigate).toHaveBeenCalledWith("/plans");
  //   // form.screen.debug();
  // });
});
