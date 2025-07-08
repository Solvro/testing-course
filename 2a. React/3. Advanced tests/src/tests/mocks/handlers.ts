import { BASE_URL } from "@/api/base-url";
import { http, HttpResponse, type RequestHandler } from "msw";

export const MOCK_OTP = "12345";

export const handlers = [
  http.post(`${BASE_URL}/user/otp/get`, () => {
    return HttpResponse.json({ success: true, otp: MOCK_OTP });
  }),
] satisfies RequestHandler[];
