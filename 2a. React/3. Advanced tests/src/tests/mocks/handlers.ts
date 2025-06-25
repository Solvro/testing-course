import { BASE_URL } from "@/api/base-url";
import { http, HttpResponse, type RequestHandler } from "msw";
import { MOCK_OTP } from "./constants";

export const handlers = [
  http.post(BASE_URL + "/user/otp/get", () =>
    HttpResponse.json({
      success: true,
      message: "OTP sent successfully",
      otp: MOCK_OTP,
    }),
  ),
  http.post(BASE_URL + "/user/otp/verify", async ({ request }) => {
    const { email, otp } = (await request.json()) as {
      email: string;
      otp: string;
    };
    return otp === MOCK_OTP
      ? HttpResponse.json({ success: true, message: "Login successful", email })
      : HttpResponse.json(
          {
            success: false,
            message: "Invalid OTP",
          },
          { status: 400 },
        );
  }),
] satisfies RequestHandler[];
