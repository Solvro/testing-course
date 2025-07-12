import type { RequestHandler } from "msw";
import { http, HttpResponse } from "msw";
import { BASE_URL } from "@/api/base-url";

export const handlers = [
  http.post(`${BASE_URL}/user/otp/get`, async ({ request }) => {
    const body = (await request.json()) as { email: string };

    if (body.email.endsWith("@student.pwr.edu.pl")) {
      return HttpResponse.json({
        success: true,
        message: "OTP sent successfully",
        otp: "123456",
      });
    }

    return HttpResponse.json(
      { success: false, message: "Invalid email domain" },
      { status: 400 }
    );
  }),

  http.post(`${BASE_URL}/user/otp/verify`, async ({ request }) => {
    const body = (await request.json()) as { email: string; otp: string };

    if (body.otp === "123456") {
      return HttpResponse.json({
        success: true,
        message: "Login successful",
        email: body.email,
      });
    }

    return HttpResponse.json(
      { success: false, message: "Invalid OTP" },
      { status: 400 }
    );
  }),
] satisfies RequestHandler[];
