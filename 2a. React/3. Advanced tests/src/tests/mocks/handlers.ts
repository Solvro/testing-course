import { BASE_URL } from "@/api/base-url";
import { http } from "msw";
import { MOCK_EMAIL, MOCK_VALID_OTP } from "./consts";

export const handlers = [
  http.get(`${BASE_URL}/`, () => {
    return Response.json({
      success: true,
      message: "Elo żelo!",
    });
  }),

  http.post(`${BASE_URL}/user/otp/get`, () => {
    return Response.json({
      success: true,
      message: "OTP sent successfully",
      otp: MOCK_VALID_OTP,
    });
  }),

  http.post(`${BASE_URL}/user/otp/verify`, async ({ request }) => {
    const { otp } = (await request.json()) as {
      otp: string;
    };

    if (otp === MOCK_VALID_OTP) {
      return Response.json({
        success: true,
        message: "Login successful",
        email: MOCK_EMAIL,
      });
    }
    return Response.json({
      success: false,
      message: "Invalid OTP",
    });
  }),
];
