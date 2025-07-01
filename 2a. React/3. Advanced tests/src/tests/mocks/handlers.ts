import type { RequestHandler } from "msw";
import { http, HttpResponse } from "msw";

export const handlers = [
  http.post("https://planer-mock-api.deno.dev/user/otp/get", async ({ request }) => {
    const body = await request.json() as { email: string };
    
    if (body.email === "test@student.pwr.edu.pl") {
      return HttpResponse.json({
        success: true,
        otp: "123456"
      });
    }
    
    return HttpResponse.json(
      { error: "Invalid email" },
      { status: 400 }
    );
  }),

  http.post("https://planer-mock-api.deno.dev/user/otp/verify", async ({ request }) => {
    const body = await request.json() as { email: string; otp: string };
    
    if (body.email === "test@student.pwr.edu.pl" && body.otp === "123456") {
      return HttpResponse.json({
        email: body.email
      });
    }
    
    if (body.otp === "000000") {
      return HttpResponse.json(
        { message: "Invalid OTP code" },
        { status: 400 }
      );
    }
    
    return HttpResponse.json(
      { message: "Authentication failed" },
      { status: 400 }
    );
  }),
] satisfies RequestHandler[];
