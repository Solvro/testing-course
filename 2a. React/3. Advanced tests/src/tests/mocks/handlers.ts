import { BASE_URL } from "@/api/base-url";
import { http, HttpResponse } from "msw";

export const handlers = [
  http.post(`${BASE_URL}/user/otp/get`, async () => {
    return HttpResponse.json({
      otp: "123456",
    });
  }),
  http.post(`${BASE_URL}/user/otp/verify`, async () => {
    return HttpResponse.json({
      succes: true,
      message: "Login successful",
    });
  }),
];
