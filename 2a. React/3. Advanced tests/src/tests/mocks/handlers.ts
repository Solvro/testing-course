import { BASE_URL } from "@/api/base-url";
import { http, HttpResponse, type RequestHandler } from "msw";

export const MOCKED_OTP = "000000";

export const handlers = [
  http.post(BASE_URL + "/user/otp/get", () =>
    HttpResponse.json({
      success: true,
      message: "OTP sent successfully",
      otp: MOCKED_OTP,
    }),
  ),
  http.post(BASE_URL + "/user/otp/verify", async ({ request }) => {
    const { otp } = (await request.json()) as { email: string; otp: string };
    return otp === MOCKED_OTP
      ? HttpResponse.json({ success: true, message: "Login successful" })
      : HttpResponse.json(
          {
            success: false,
            message: "Invalid OTP",
          },
          { status: 400 },
        );
  }),
] satisfies RequestHandler[];
