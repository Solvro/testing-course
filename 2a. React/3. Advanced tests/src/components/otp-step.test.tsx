import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { http, HttpResponse } from "msw";

import { OtpStep } from "@/components/otp-step";
import { AuthProvider } from "@/contexts/auth-context";
import { BASE_URL } from "@/api/base-url";
import { server } from "../tests/mocks/server";
import { handlers } from "../tests/mocks/handlers";

// Mock toast notifications
vi.mock("sonner", () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
	},
}));

// Mock navigate
const mockNavigate = vi.fn();
vi.mock("react-router", async (importOriginal) => {
	const mod = await importOriginal<typeof import("react-router")>();
	return {
		...mod,
		useNavigate: () => mockNavigate,
	};
});

// Test wrapper component that provides necessary context
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
	return (
		<MemoryRouter>
			<AuthProvider>{children}</AuthProvider>
		</MemoryRouter>
	);
};

describe("OtpStep", () => {
	const user = userEvent.setup();
	const testEmail = "test@student.pwr.edu.pl";

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

	const renderOtpStep = () => {
		return render(
			<TestWrapper>
				<OtpStep email={testEmail} />
			</TestWrapper>
		);
	};

	it("renders OTP form with correct elements", () => {
		renderOtpStep();

		expect(screen.getByText("Hasło jednorazowe")).toBeInTheDocument();
		expect(
			screen.getByText(
				"Wpisz kod, który wylądował właśnie na Twoim adresie email"
			)
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /zaloguj się/i })
		).toBeInTheDocument();

		// Check for OTP input slots
		expect(screen.getByRole("textbox")).toBeInTheDocument();
	});

	it("shows validation error for empty OTP", async () => {
		renderOtpStep();

		const submitButton = screen.getByRole("button", { name: /zaloguj się/i });
		await user.click(submitButton);

		await waitFor(() => {
			expect(
				screen.getByText("Kod OTP musi mieć 6 znaków")
			).toBeInTheDocument();
		});
	});

	it("shows validation error for short OTP", async () => {
		renderOtpStep();

		const otpInput = screen.getByRole("textbox");
		const submitButton = screen.getByRole("button", { name: /zaloguj się/i });

		await user.type(otpInput, "123");
		await user.click(submitButton);

		await waitFor(() => {
			expect(
				screen.getByText("Kod OTP musi mieć 6 znaków")
			).toBeInTheDocument();
		});
	});

	it("shows validation error for non-numeric OTP", async () => {
		renderOtpStep();

		const otpInput = screen.getByRole("textbox");
		const submitButton = screen.getByRole("button", { name: /zaloguj się/i });

		await user.type(otpInput, "abc123");
		await user.click(submitButton);

		await waitFor(() => {
			expect(
				screen.getByText("Kod OTP może zawierać tylko cyfry")
			).toBeInTheDocument();
		});
	});

	it("successfully submits valid OTP and logs in", async () => {
		const { toast } = await import("sonner");

		// Set up successful response
		server.use(
			http.post(`${BASE_URL}/user/otp/verify`, () => {
				return HttpResponse.json({
					email: testEmail,
					success: true,
				});
			})
		);

		renderOtpStep();

		const otpInput = screen.getByRole("textbox");
		const submitButton = screen.getByRole("button", { name: /zaloguj się/i });

		await user.type(otpInput, "123456");
		await user.click(submitButton);

		await waitFor(() => {
			expect(toast.success).toHaveBeenCalledWith("Zalogowano pomyślnie");
			expect(mockNavigate).toHaveBeenCalledWith("/plans");
		});
	});

	it("shows loading state during submission", async () => {
		// Set up successful response with delay
		server.use(
			http.post(`${BASE_URL}/user/otp/verify`, async () => {
				// Add delay to simulate network request and see loading state
				await new Promise((resolve) => setTimeout(resolve, 100));
				return HttpResponse.json({
					email: testEmail,
				});
			})
		);

		renderOtpStep();

		const otpInput = screen.getByRole("textbox");
		const submitButton = screen.getByRole("button", { name: /zaloguj się/i });

		await user.type(otpInput, "123456");

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

	it("handles API error with default message", async () => {
		const { toast } = await import("sonner");

		// Set up error response without message
		server.use(
			http.post(`${BASE_URL}/user/otp/verify`, () => {
				return HttpResponse.json({}, { status: 400 });
			})
		);

		renderOtpStep();

		const otpInput = screen.getByRole("textbox");
		const submitButton = screen.getByRole("button", { name: /zaloguj się/i });

		await user.type(otpInput, "999999");
		await user.click(submitButton);

		// When there's no message in the response, it should fall back to default message
		await waitFor(() => {
			expect(toast.error).toHaveBeenCalledWith("Błąd podczas logowania");
		});
	});

	it("shows validation error for non-numeric input", async () => {
		renderOtpStep();

		const otpInput = screen.getByRole("textbox");
		const submitButton = screen.getByRole("button", { name: /zaloguj się/i });

		// Type non-numeric characters
		await user.type(otpInput, "abc123");
		await user.click(submitButton);

		// Should show validation error for non-numeric input
		await waitFor(() => {
			expect(
				screen.getByText("Kod OTP może zawierać tylko cyfry")
			).toBeInTheDocument();
		});
	});

	it("limits input to 6 characters", async () => {
		renderOtpStep();

		const otpInput = screen.getByRole("textbox");

		// Try to type more than 6 digits
		await user.type(otpInput, "1234567890");

		// Should only accept first 6 characters
		expect(otpInput).toHaveValue("123456");
	});

	it("handles other HTTP errors silently", async () => {
		const { toast } = await import("sonner");

		// Set up 500 error response
		server.use(
			http.post(`${BASE_URL}/user/otp/verify`, () => {
				return new HttpResponse(null, { status: 500 });
			})
		);

		renderOtpStep();

		const otpInput = screen.getByRole("textbox");
		const submitButton = screen.getByRole("button", { name: /zaloguj się/i });

		await user.type(otpInput, "123456");
		await user.click(submitButton);

		// No toast should be called for non-400 errors
		expect(toast.error).not.toHaveBeenCalled();
		expect(toast.success).not.toHaveBeenCalled();

		// Should not navigate on error
		expect(mockNavigate).not.toHaveBeenCalled();
	});
});
