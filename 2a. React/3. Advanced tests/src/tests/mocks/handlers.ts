import { http, HttpResponse } from "msw";
import { BASE_URL } from "@/api/base-url";
import type { RequestHandler } from "msw";

export const handlers = [
  http.post(`${BASE_URL}/user/otp/get`, () => {
    return HttpResponse.json({
      success: true,
      otp: "123456",
    });
  }),

  http.post(`${BASE_URL}/user/otp/verify`, () => {
    return HttpResponse.json({
      email: "student@pwr.edu.pl",
    });
  }),
] satisfies RequestHandler[];
