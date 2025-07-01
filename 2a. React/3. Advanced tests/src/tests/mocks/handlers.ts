import { http, HttpResponse } from "msw";
import { BASE_URL } from "@/api/base-url";

const MOCK_VALID_EMAIL = "123456@student.pwr.edu.pl";
const MOCK_VALID_OTP = "123456";

export const handlers = [
  http.post(`${BASE_URL}/user/otp/get`, () => {
    console.info("[MSW] Mocked GET OTP request");
    return HttpResponse.json({
      success: true,
      otp: MOCK_VALID_OTP,
    });
  }),

  http.post(`${BASE_URL}/user/otp/verify`, async ({ request }) => {
    const { otp, email } = (await request.json()) as { otp: string; email: string };
    console.info(`[MSW] Mocked VERIFY OTP request for ${email}`);
    if (email === MOCK_VALID_EMAIL && otp === MOCK_VALID_OTP) {
      return HttpResponse.json({
        success: true,
        email,
      });
    }
    return HttpResponse.json(
      { message: "Nieprawidłowy kod OTP lub email" },
      { status: 400 },
    );
  }),
];