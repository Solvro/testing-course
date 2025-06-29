import { BASE_URL } from "@/api/base-url";
import { http, HttpResponse, type RequestHandler } from "msw";

export const handlers = [
  http.post(`${BASE_URL}/user/otp/get`, async () => {
    return HttpResponse.json({
      success: true,
      otp: "123456",
    });
  }),
  http.post(`${BASE_URL}/user/otp/verify`, async ({ request }) => {
    const { email, otp } = (await request.json()) as {
      email: string;
      otp: string;
    };

    if (otp === "123456") {
      return HttpResponse.json({ email }, { status: 200 });
    }

    return HttpResponse.json({ message: "Wrong OTP" }, { status: 400 });
  }),
] satisfies RequestHandler[];
