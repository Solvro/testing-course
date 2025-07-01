import { http, HttpResponse, type RequestHandler } from "msw";

import { BASE_URL } from "@/api/base-url";

export const handlers = [
  // Default success handler for OTP get endpoint
  http.post(`${BASE_URL}/user/otp/get`, () => {
    return HttpResponse.json({
      success: true,
      message: "OTP sent successfully",
      otp: "123456",
    });
  }),

  // Default handler for OTP verify endpoint
  http.post(`${BASE_URL}/user/otp/verify`, async ({ request }) => {
    const { otp } = (await request.json()) as { otp: string };

    if (otp === "123456") {
      return HttpResponse.json({
        success: true,
        message: "Login successful",
        email: "test@student.pwr.edu.pl",
      });
    }

    return HttpResponse.json(
      { success: false, message: "Invalid OTP" },
      { status: 400 },
    );
  }),
] satisfies RequestHandler[];

// Additional handlers for specific test scenarios
export const testHandlers = {
  // Handler for successful OTP verification (for loading state tests)
  otpVerifySuccess: http.post(`${BASE_URL}/user/otp/verify`, () => {
    return HttpResponse.json({
      success: true,
      message: "Login successful",
      email: "test@student.pwr.edu.pl",
    });
  }),

  // Handler for API error with default message (no message property)
  otpVerifyErrorNoMessage: http.post(`${BASE_URL}/user/otp/verify`, () => {
    return HttpResponse.json({}, { status: 400 });
  }),

  // Handler for 500 server error (silent handling)
  otpVerifyServerError: http.post(`${BASE_URL}/user/otp/verify`, () => {
    return new HttpResponse(null, { status: 500 });
  }),

  // Email step handlers
  // Handler for OTP get server error
  otpGetServerError: http.post(`${BASE_URL}/user/otp/get`, () => {
    return new HttpResponse(null, { status: 500 });
  }),
};
