import { http, HttpResponse } from "msw";
import { BASE_URL } from "@/api/base-url";

const mockOtp = "420420";

//without it ts was acting up, idk if this is the correct way...
type OtpRequest = {
  email: string;
};

type VerifyOtpRequest = {
  email: string;
  otp: string;
};

export const handlers = [
  http.post(`${BASE_URL}/user/otp/get`, async ({ request }) => {
    const body = (await request.json()) as OtpRequest;
    const { email } = body;

    if (!email.includes("@student.pwr.edu.pl")) {
      return HttpResponse.json(
        {
          success: false,
          message: "Email musi kończyć się na @student.pwr.edu.pl",
        },
        { status: 400 }
      );
    }

    return HttpResponse.json({
      success: true,
      message: "OTP sent successfully",
      otp: mockOtp,
    });
  }),

  http.post(`${BASE_URL}/user/otp/verify`, async ({ request }) => {
    const body = (await request.json()) as VerifyOtpRequest;
    const { email, otp } = body;

    if (otp === mockOtp) {
      return HttpResponse.json({
        success: true,
        message: "Login successful",
        email,
      });
    }

    return HttpResponse.json(
      {
        success: false,
        message: "Invalid OTP",
      },
      { status: 400 }
    );
  }),
];
