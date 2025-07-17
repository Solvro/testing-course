import type { RequestHandler } from "msw";
import { http, HttpResponse } from 'msw';
import { BASE_URL } from "@/api/base-url.ts";

export const OTP: number = 123456;

export const handlers = [
  http.post(`${BASE_URL}/user/otp/get`, async ({request}) => {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return HttpResponse.json({ success: false, message: "Valid email is required" }, { status: 400 });
    }

    return HttpResponse.json({ success: true, message: "OTP sent successfully", otp: OTP });
  }),

  http.post(`${BASE_URL}/user/otp/verify`, async ({request}) => {
    const { email, otp } = await request.json();

    if (!email || typeof email !== "string" || !otp || typeof otp !== "string") {
      return HttpResponse.json({ success: false, message: "Email and OTP are required" }, { status: 400 });
    }

    if (otp == OTP) {
      return HttpResponse.json({ success: true, message: "Login successful", email });
    } else {
      return HttpResponse.json({ success: false, message: `Invalid OTP - please use ${OTP}`}, { status: 400 })
    }
  })
] satisfies RequestHandler[];
