import type { RequestHandler } from "msw";
import { http } from "msw";
import { BASE_URL } from "@/api/base-url";

export const handlers = [
  http.post(`${BASE_URL}/user/otp/get`, () => {
    return Response.json({
      success: true,
      message: "OTP sent successfully",
      otp: "123456", // Example OTP for testing
    });
  }),
  http.post(`${BASE_URL}/user/otp/verify`, () => {
    return Response.json({
      success: true,
      message: "Login successful",
    });
  }),
] satisfies RequestHandler[];
