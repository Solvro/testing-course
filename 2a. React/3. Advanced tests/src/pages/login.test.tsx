import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

import { LoginPage } from "@/pages/login";
import { AuthProvider } from "@/contexts/auth-context";

// Mock the assets to avoid import issues in tests
vi.mock("@/assets/logo_solvro_color.png", () => ({
	default: "logo-color.png",
}));
vi.mock("@/assets/logo_solvro_mono.png", () => ({ default: "logo-mono.png" }));
vi.mock("@/assets/planer_bg.png", () => ({ default: "bg.png" }));

// Mock navigate to track navigation calls
const mockNavigate = vi.fn();
vi.mock("react-router", async (importOriginal) => {
	const mod = await importOriginal<typeof import("react-router")>();
	return {
		...mod,
		useNavigate: () => mockNavigate,
	};
});

// Mock toast notifications
vi.mock("sonner", () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
	},
}));

// Test wrapper component that provides necessary context
const TestWrapper = ({
	children,
	initialEntries = ["/login"],
}: {
	children: React.ReactNode;
	initialEntries?: string[];
}) => {
	return (
		<MemoryRouter initialEntries={initialEntries}>
			<AuthProvider>{children}</AuthProvider>
		</MemoryRouter>
	);
};

describe("LoginPage", () => {
	const user = userEvent.setup();

	beforeEach(() => {
		vi.clearAllMocks();
		// Clear console.info mock
		vi.spyOn(console, "info").mockImplementation(() => {});
	});

	afterEach(() => {
		cleanup();
		// Clear any pending timers
		vi.clearAllTimers();
	});

	it("renders login form with email step initially", () => {
		render(
			<TestWrapper>
				<LoginPage />
			</TestWrapper>
		);

		expect(screen.getByText("Zaloguj się do planera")).toBeInTheDocument();
		expect(screen.getByLabelText("Adres e-mail")).toBeInTheDocument();
		expect(
			screen.getByPlaceholderText("123456@student.pwr.edu.pl")
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /wyślij kod/i })
		).toBeInTheDocument();
	});

	it("shows validation error for invalid email format", async () => {
		render(
			<TestWrapper>
				<LoginPage />
			</TestWrapper>
		);

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

	it("shows validation error for email not ending with @student.pwr.edu.pl", async () => {
		render(
			<TestWrapper>
				<LoginPage />
			</TestWrapper>
		);

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

	it("successfully sends OTP request and moves to OTP step", async () => {
		render(
			<TestWrapper>
				<LoginPage />
			</TestWrapper>
		);

		const emailInput = screen.getByLabelText("Adres e-mail");
		const submitButton = screen.getByRole("button", { name: /wyślij kod/i });

		await user.type(emailInput, "test@student.pwr.edu.pl");
		await user.click(submitButton);

		await waitFor(() => {
			expect(screen.getByText("Hasło jednorazowe")).toBeInTheDocument();
		});

		// Check that OTP step is displayed
		expect(
			screen.getByText(
				"Wpisz kod, który wylądował właśnie na Twoim adresie email"
			)
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /zaloguj się/i })
		).toBeInTheDocument();
	});

	it("shows loading state when submitting email", async () => {
		render(
			<TestWrapper>
				<LoginPage />
			</TestWrapper>
		);

		const emailInput = screen.getByLabelText("Adres e-mail");
		const submitButton = screen.getByRole("button", { name: /wyślij kod/i });

		await user.type(emailInput, "test@student.pwr.edu.pl");
		await user.click(submitButton);

		// Check for loading state (button should be disabled)
		expect(submitButton).toBeDisabled();
	});

	it("logs OTP to console when email step is successful", async () => {
		const consoleSpy = vi.spyOn(console, "info");

		render(
			<TestWrapper>
				<LoginPage />
			</TestWrapper>
		);

		const emailInput = screen.getByLabelText("Adres e-mail");
		const submitButton = screen.getByRole("button", { name: /wyślij kod/i });

		await user.type(emailInput, "test@student.pwr.edu.pl");
		await user.click(submitButton);

		await waitFor(() => {
			expect(consoleSpy).toHaveBeenCalledWith("Kod OTP to 123456 😍");
		});
	});

	it("successfully completes login flow", async () => {
		const { toast } = await import("sonner");

		render(
			<TestWrapper>
				<LoginPage />
			</TestWrapper>
		);

		// Complete email step
		const emailInput = screen.getByLabelText("Adres e-mail");
		await user.type(emailInput, "test@student.pwr.edu.pl");
		await user.click(screen.getByRole("button", { name: /wyślij kod/i }));

		await waitFor(() => {
			expect(screen.getByText("Hasło jednorazowe")).toBeInTheDocument();
		});

		// Find the OTP input field
		const otpField = screen.getByRole("textbox");
		await user.type(otpField, "123456");

		// Fill in OTP and submit
		const loginButton = screen.getByRole("button", { name: /zaloguj się/i });
		await user.click(loginButton);

		await waitFor(() => {
			expect(toast.success).toHaveBeenCalledWith("Zalogowano pomyślnie");
			expect(mockNavigate).toHaveBeenCalledWith("/plans");
		});
	});

	it("shows error message for invalid OTP", async () => {
		const { toast } = await import("sonner");

		render(
			<TestWrapper>
				<LoginPage />
			</TestWrapper>
		);

		// Complete email step
		const emailInput = screen.getByLabelText("Adres e-mail");
		await user.type(emailInput, "test@student.pwr.edu.pl");
		await user.click(screen.getByRole("button", { name: /wyślij kod/i }));

		await waitFor(() => {
			expect(screen.getByText("Hasło jednorazowe")).toBeInTheDocument();
		});

		// Fill in invalid OTP and submit
		const loginButton = screen.getByRole("button", { name: /zaloguj się/i });
		const otpField = screen.getByRole("textbox");

		// Type invalid OTP (anything other than 123456)
		await user.type(otpField, "999999");
		await user.click(loginButton);

		await waitFor(() => {
			expect(toast.error).toHaveBeenCalledWith("Invalid OTP");
		});
	});

	it("displays both light and dark logos", () => {
		render(
			<TestWrapper>
				<LoginPage />
			</TestWrapper>
		);

		const logos = screen.getAllByAltText("Solvro Logo");
		expect(logos).toHaveLength(2);

		const colorLogo = logos[0];
		expect(colorLogo).toHaveClass("block", "dark:hidden");

		const monoLogo = logos[1];
		expect(monoLogo).toHaveClass("hidden", "dark:block");
	});

	it("displays explanatory text about email domain requirement", () => {
		render(
			<TestWrapper>
				<LoginPage />
			</TestWrapper>
		);

		expect(
			screen.getByText(/Podaj swój email z domeny Politechniki Wrocławskiej/)
		).toBeInTheDocument();
		expect(screen.getByText(/wyświetlimy Ci go w konsoli/)).toBeInTheDocument();
	});
});
