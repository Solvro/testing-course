import { http, HttpResponse } from "msw";
import type { RequestHandler } from "msw";

export const handlers = [
  http.post("https://planer-mock-api.deno.dev/user/otp/get", async ({ request }) => {
    const body = await request.json() as { email: string };
    
    if (!body.email) {
      return HttpResponse.json(
        { success: false, message: "Valid email is required" },
        { status: 400 }
      );
    }

    const mockOtp = "123456";
    return HttpResponse.json({
      success: true,
      message: "OTP sent successfully",
      otp: mockOtp,
    });
  }),

  http.post("https://planer-mock-api.deno.dev/user/otp/verify", async ({ request }) => {
    const body = await request.json() as { email: string; otp: string };
    
    if (!body.email || !body.otp) {
      return HttpResponse.json(
        { success: false, message: "Email and OTP are required" },
        { status: 400 }
      );
    }

    if (body.otp === "123456") {
      return HttpResponse.json({
        success: true,
        message: "Login successful",
        email: body.email,
      });
    }

    return HttpResponse.json(
      { success: false, message: "Invalid OTP" },
      { status: 400 }
    );
  }),

  http.get("https://planer-mock-api.deno.dev/", () => {
    return HttpResponse.json({
      message: "Solvro Mock API for OTP Login",
      version: "1.0.0",
      endpoints: {
        otp: {
          send: {
            post: "/user/otp/get",
            description: "Symuluje wysłanie kodu OTP na email. Dla testów zwraca wygenerowany OTP.",
            request: "{ email: string }",
            response: "{ success: true, message: 'OTP sent successfully', otp: '123456' }",
          },
          verify: {
            post: "/user/otp/verify",
            description: "Weryfikuje podany OTP dla danego emaila.",
            request: "{ email: string, otp: string }",
            response: "{ success: true, message: 'Login successful' } | { success: false, message: 'Invalid OTP' }",
          },
        },
      },
    });
  }),
] satisfies RequestHandler[];
