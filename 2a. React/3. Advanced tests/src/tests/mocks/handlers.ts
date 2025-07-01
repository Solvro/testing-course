import { http, HttpResponse, type RequestHandler } from "msw";

import { BASE_URL } from "@/api/base-url";

export const handlers = [
  http.post(`${BASE_URL}/user/otp/get`, () => {
    return HttpResponse.json({
      success: true,
      message: "OTP sent successfully",
      otp: "123456",
    });
  }),
  http.post(`${BASE_URL}/user/otp/verify`, async ({ request }) => {
    const { otp } = (await request.json()) as { otp: string };

    if (otp === "123456") {
      return HttpResponse.json({
        success: true,
        message: "Login successful",
      });
    }

    return HttpResponse.json(
      { success: false, message: "Invalid OTP" },
      { status: 400 },
    );
  }),
] satisfies RequestHandler[];
