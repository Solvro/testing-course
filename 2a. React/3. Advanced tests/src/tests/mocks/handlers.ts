import { BASE_URL } from "@/api/base-url";
import { http } from "msw";

export const handlers = [
    http.get(`${BASE_URL}/`, () => {
        return Response.json({
            status: "OK"
        });
    }),
    
    http.post(`${BASE_URL}/user/otp/get`, () => {
        return Response.json({
            success: true,
            message: "OTP sent successfully",
            otp: "000000",
        });
    }),

    http.post(`${BASE_URL}/user/otp/verify`, async ({ request }) => {
        const { email } = await request.json();
        return Response.json({ success: true, message: "Login successful", email });
    }),
];
