import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { http, HttpResponse } from "msw";

import { EmailStep } from "@/components/email-step";
import { BASE_URL } from "@/api/base-url";
import { server } from "../tests/mocks/server";
import { handlers } from "../tests/mocks/handlers";

// Mock toast notifications
vi.mock("sonner", () => ({
	toast: {
		error: vi.fn(),
	},
}));

describe("EmailStep", () => {
	const user = userEvent.setup();
	const mockSetStep = vi.fn();
	const mockSetEmail = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		// Reset handlers to the original state before each test
		server.resetHandlers(...handlers);
	});

	afterEach(() => {
		cleanup();
		// Clear any pending timers
		vi.clearAllTimers();
	});

	const renderEmailStep = () => {
		return render(<EmailStep setStep={mockSetStep} setEmail={mockSetEmail} />);
	};

	it("renders email form with correct elements", () => {
		renderEmailStep();

		expect(screen.getByLabelText("Adres e-mail")).toBeInTheDocument();
		expect(
			screen.getByPlaceholderText("123456@student.pwr.edu.pl")
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /wyślij kod/i })
		).toBeInTheDocument();
	});

	it("shows validation error for empty email", async () => {
		renderEmailStep();

		const submitButton = screen.getByRole("button", { name: /wyślij kod/i });
		await user.click(submitButton);

		await waitFor(() => {
			expect(
				screen.getByText("Podaj poprawny adres email")
			).toBeInTheDocument();
		});
	});

	it("shows validation error for invalid email format", async () => {
		renderEmailStep();

		const emailInput = screen.getByLabelText("Adres e-mail");
		const submitButton = screen.getByRole("button", { name: /wyślij kod/i });

		await user.type(emailInput, "invalid-email");
		await user.click(submitButton);

		await waitFor(() => {
			expect(
				screen.getByText("Podaj poprawny adres email")
			).toBeInTheDocument();
		});
	});

	it("shows validation error for email with wrong domain", async () => {
		renderEmailStep();

		const emailInput = screen.getByLabelText("Adres e-mail");
		const submitButton = screen.getByRole("button", { name: /wyślij kod/i });

		await user.type(emailInput, "test@gmail.com");
		await user.click(submitButton);

		await waitFor(() => {
			expect(
				screen.getByText("Adres email musi kończyć się na @student.pwr.edu.pl")
			).toBeInTheDocument();
		});
	});

	it("successfully submits valid email", async () => {
		// Set up successful response
		server.use(
			http.post(`${BASE_URL}/user/otp/get`, () => {
				return HttpResponse.json({
					success: true,
					otp: "123456",
				});
			})
		);

		renderEmailStep();

		const emailInput = screen.getByLabelText("Adres e-mail");
		const submitButton = screen.getByRole("button", { name: /wyślij kod/i });

		await user.type(emailInput, "test@student.pwr.edu.pl");
		await user.click(submitButton);

		await waitFor(() => {
			expect(mockSetEmail).toHaveBeenCalledWith("test@student.pwr.edu.pl");
			expect(mockSetStep).toHaveBeenCalledWith("otp");
		});
	});

	it("shows loading state during submission", async () => {
		// Set up a response that has a delay to capture loading state
		server.use(
			http.post(`${BASE_URL}/user/otp/get`, async () => {
				// Add delay to simulate network request and see loading state
				await new Promise((resolve) => setTimeout(resolve, 100));
				return HttpResponse.json({
					success: true,
					otp: "123456",
				});
			})
		);

		renderEmailStep();

		const emailInput = screen.getByLabelText("Adres e-mail");
		const submitButton = screen.getByRole("button", { name: /wyślij kod/i });

		await user.type(emailInput, "test@student.pwr.edu.pl");

		// Start the submission
		const submitPromise = user.click(submitButton);

		// Check loading state after React has a chance to update
		await waitFor(
			() => {
				expect(submitButton).toBeDisabled();
			},
			{ timeout: 500 }
		);

		// Wait for submission to complete
		await submitPromise;
	});

	it("logs OTP to console on successful submission", async () => {
		const consoleSpy = vi.spyOn(console, "info").mockImplementation(() => {});

		// Set up successful response
		server.use(
			http.post(`${BASE_URL}/user/otp/get`, () => {
				return HttpResponse.json({
					success: true,
					otp: "123456",
				});
			})
		);

		renderEmailStep();

		const emailInput = screen.getByLabelText("Adres e-mail");
		const submitButton = screen.getByRole("button", { name: /wyślij kod/i });

		await user.type(emailInput, "test@student.pwr.edu.pl");
		await user.click(submitButton);

		await waitFor(() => {
			expect(consoleSpy).toHaveBeenCalledWith("Kod OTP to 123456 😍");
		});

		consoleSpy.mockRestore();
	});

	it("handles API error gracefully", async () => {
		const { toast } = await import("sonner");

		// Set up server error response
		server.use(
			http.post(`${BASE_URL}/user/otp/get`, () => {
				return new HttpResponse(null, { status: 500 });
			})
		);

		renderEmailStep();

		const emailInput = screen.getByLabelText("Adres e-mail");
		const submitButton = screen.getByRole("button", { name: /wyślij kod/i });

		await user.type(emailInput, "test@student.pwr.edu.pl");
		await user.click(submitButton);

		// Wait for the API call to complete and error handling to occur
		await waitFor(
			() => {
				expect(toast.error).toHaveBeenCalledWith(
					"Wystąpił błąd podczas wysyłania kodu"
				);
			},
			{ timeout: 2000 }
		);

		// Should not change step or email on error
		expect(mockSetStep).not.toHaveBeenCalled();
		expect(mockSetEmail).not.toHaveBeenCalled();
	});
});
