import type { RequestHandler } from "msw";
import { BASE_URL } from "@/api/base-url";
import { http, HttpResponse } from "msw";

export const handlers = [
  http.post(`${BASE_URL}/user/otp/get`, () => {
    return HttpResponse.json({
      success: true,
      message: "OTP sent successfully",
      otp: "04072025",
    });
  }),

  http.post(`${BASE_URL}/user/otp/verify`, () => {
    return HttpResponse.json({
      success: true,
      message: "Logged in successfully",
      email: "282267@student.pwr.edu.pl",
    });
  }),
] satisfies RequestHandler[];
