import { BASE_URL } from "@/api/base-url";
import { http, HttpResponse, type RequestHandler } from "msw";
import { MOCK_OTP } from "./constants";

export const handlers = [
  http.post(`${BASE_URL}/user/otp/get`, () => {
    return HttpResponse.json({ success: true, otp: MOCK_OTP });
  }),
  http.post(`${BASE_URL}/user/otp/verify`, async ({ request }) => {
    const { email, otp } = (await request.json()) as {
      email: string;
      otp: string;
    };

    if (otp === MOCK_OTP) {
      return HttpResponse.json({ success: true, email });
    } else {
      return HttpResponse.json(
        { success: false, message: "Invalid OTP" },
        { status: 400 }
      );
    }
  }),
] satisfies RequestHandler[];
