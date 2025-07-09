import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { server } from "@/tests/mocks/server";
import { http, HttpResponse } from "msw";
import { BASE_URL } from "@/api/base-url";

describe("API Handlers", () => {
  beforeEach(() => {
    server.listen();
  });

  afterEach(() => {
    server.resetHandlers();
    server.close();
  });

  it("handles OTP request successfully", async () => {
    const response = await fetch(`${BASE_URL}/user/otp/get`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "test@student.pwr.edu.pl",
      }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.message).toBe("OTP sent successfully");
  });

  it("handles OTP verification successfully", async () => {
    const response = await fetch(`${BASE_URL}/user/otp/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "test@student.pwr.edu.pl",
        otp: "123456",
      }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.message).toBe("Login successful");
    expect(data.email).toBe("test@student.pwr.edu.pl");
  });

  it("handles invalid OTP verification", async () => {
    const response = await fetch(`${BASE_URL}/user/otp/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "test@student.pwr.edu.pl",
        otp: "wrong",
      }),
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.message).toBe("Invalid OTP");
  });

  it("handles any email domain for OTP request", async () => {
    const response = await fetch(`${BASE_URL}/user/otp/get`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "test@gmail.com",
      }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.message).toBe("OTP sent successfully");
  });

  it("handles server error responses", async () => {
    server.use(
      http.post(`${BASE_URL}/user/otp/get`, () => {
        return HttpResponse.json(
          { message: "Internal server error" },
          { status: 500 }
        );
      })
    );

    const response = await fetch(`${BASE_URL}/user/otp/get`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "test@student.pwr.edu.pl",
      }),
    });

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.message).toBe("Internal server error");
  });
});
