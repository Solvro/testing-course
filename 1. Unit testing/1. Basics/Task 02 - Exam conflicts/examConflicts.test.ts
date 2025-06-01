import { describe, it, expect } from "vitest";
import {
	canRegister,
	computeRegistrationFee,
	type Exam,
} from "./examConflicts";

const exam = {
	subject: "Analiza matematyczna 2",
	date: new Date("2025-07-02"),
	durationMinutes: 90,
	location: "C-13",
	fee: 100,
	earlyBirdDeadline: new Date("2025-06-25"),
	registrationDeadline: new Date("2025-06-30"),
} satisfies Exam;

describe("canRegister", () => {
	it.each([
		{
			scenario: "before deadline date",
			now: new Date("2025-06-25"),
			result: true,
		},
		{
			scenario: "during deadline date",
			now: new Date("2025-06-30"),
			result: true,
		},
		{
			scenario: "after deadline date",
			now: new Date("2025-07-01"),
			result: false,
		},
	])("should return $result if current date is $scenario", ({ now, result }) => {
		expect(canRegister(exam, now)).toBe(result);
	});
});

describe("computeRegistrationFee", () => {
	it("should return a 20% discounted fee when current date is before earlyBirdDeadline", () => {
		const now = new Date("2025-06-20");

		expect(computeRegistrationFee(exam, now)).toBe(exam.fee * 0.8);
	});

	it("should return a discounted fee when current date is during earlyBirdDeadline", () => {
		const now = exam.earlyBirdDeadline;

		expect(computeRegistrationFee(exam, now)).toBe(exam.fee * 0.8);
	});

	it("should return the full fee when current date is after earlyBirdDeadline", () => {
		const now = new Date("2025-06-28");

		expect(computeRegistrationFee(exam, now)).toBe(exam.fee);
	});

	it("should throw an error when current date is after registerationDeadline", () => {
		const now = new Date("2025-07-01");

		expect(() => computeRegistrationFee(exam, now)).toThrow(/closed/i);
	});
});
