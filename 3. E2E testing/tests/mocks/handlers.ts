import type { Page } from "@playwright/test";
import { BASE_URL } from "../../src/api/base-url";
import { INVALID_OTP_MESSAGE, MOCK_OTP } from "./constants";

export const mockGetOtp = (page: Page) =>
  page.route(`${BASE_URL}/user/otp/get`, (route) =>
    route.fulfill({
      json: {
        success: true,
        message: "OTP sent successfully",
        otp: MOCK_OTP.VALID,
      },
    }),
  );

export const mockVerifyOtp = (page: Page) =>
  page.route(BASE_URL + "/user/otp/verify", (route) => {
    const { email, otp } = route.request().postDataJSON() as {
      email: string;
      otp: string;
    };
    return route.fulfill(
      otp === MOCK_OTP.VALID
        ? { json: { success: true, message: "Login successful", email } }
        : {
            json: {
              success: false,
              message: INVALID_OTP_MESSAGE,
            },
            status: 400,
          },
    );
  });
