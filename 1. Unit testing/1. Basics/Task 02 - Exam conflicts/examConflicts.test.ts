import { describe, it, expect } from "vitest";
import {
    parseExamSchedule,
    canRegister,
    computeRegistrationFee,
    scheduleExamReminders,
    detectExamConflicts,
    ExamRaw,
    Exam
} from "./examConflicts";

const validExamRaw: ExamRaw = {
    subject: "Informatyka śledcza",
    date: "2025-06-10T09:00:00.000Z",
    durationMinutes: 90,
    location: "Remote",
    fee: 100,
    earlyBirdDeadline: "2025-06-01T00:00:00.000Z",
    registrationDeadline: "2025-06-05T00:00:00.000Z",
};

describe("parseExamSchedule()", () => {
    it("should parse a valid ExamRaw JSON into Exam objects", () => {
        const json = JSON.stringify([validExamRaw]);
        const result = parseExamSchedule(json);
        expect(result[0]).toMatchObject({
            subject: "Informatyka śledcza",
            location: "Remote",
            fee: 100,
            durationMinutes: 90,
        });
        expect(result[0].date).toBeInstanceOf(Date);
    });

    it("should throw on invalid JSON", () => {
        expect(() => parseExamSchedule("not json")).toThrow(/Invalid JSON/);
    });

    it("should throw if input is not an array", () => {
        expect(() => parseExamSchedule("{}")).toThrow(/Expected an array/);
    });

    it("should throw if required fields are missing", () => {
        const broken = { ...validExamRaw };
        delete (broken as any).subject;
        expect(() =>
            parseExamSchedule(JSON.stringify([broken]))
        ).toThrow(/subject/);
    });

    it("should throw if deadlines are out of order", () => {
        const badDeadlines = {
            ...validExamRaw,
            earlyBirdDeadline: "2025-06-06T00:00:00.000Z",
        };
        expect(() =>
            parseExamSchedule(JSON.stringify([badDeadlines]))
        ).toThrow(/Early-bird deadline after registration deadline/);
    });
});

describe("canRegister()", () => {
    const exam: Exam = {
        ...validExamRaw,
        date: new Date(validExamRaw.date),
        earlyBirdDeadline: new Date(validExamRaw.earlyBirdDeadline),
        registrationDeadline: new Date(validExamRaw.registrationDeadline),
    };

    it("should return true before the registration deadline", () => {
        const now = new Date("2025-06-01T12:00:00.000Z");
        expect(canRegister(exam, now)).toBe(true);
    });

    it("should return false after the registration deadline", () => {
        const now = new Date("2025-06-06T00:00:00.000Z");
        expect(canRegister(exam, now)).toBe(false);
    });
});

describe("computeRegistrationFee()", () => {
    const exam: Exam = {
        ...validExamRaw,
        date: new Date(validExamRaw.date),
        earlyBirdDeadline: new Date(validExamRaw.earlyBirdDeadline),
        registrationDeadline: new Date(validExamRaw.registrationDeadline),
    };

    it("should return discounted fee before early bird deadline", () => {
        const now = new Date("2025-05-30T00:00:00.000Z");
        expect(computeRegistrationFee(exam, now)).toBe(80);
    });

    it("should return full fee before registration deadline", () => {
        const now = new Date("2025-06-03T00:00:00.000Z");
        expect(computeRegistrationFee(exam, now)).toBe(100);
    });

    it("should throw after registration deadline", () => {
        const now = new Date("2025-06-06T00:00:00.000Z");
        expect(() => computeRegistrationFee(exam, now)).toThrow(/Registration closed/);
    });
});

describe("scheduleExamReminders()", () => {
    const exam: Exam = {
        ...validExamRaw,
        date: new Date("2025-06-10T09:00:00.000Z"),
        earlyBirdDeadline: new Date(validExamRaw.earlyBirdDeadline),
        registrationDeadline: new Date(validExamRaw.registrationDeadline),
    };

    it("should schedule reminders for valid daysBefore", () => {
        const now = new Date("2025-06-01T00:00:00.000Z");
        const reminders = scheduleExamReminders([exam], [1, 3, 5], now);
        expect(reminders.length).toBe(3);
        expect(reminders[0].message).toMatch(/5 day\(s\)/);
    });

    it("should skip reminders scheduled in the past", () => {
        const now = new Date("2025-06-09T10:00:00.000Z");
        const reminders = scheduleExamReminders([exam], [1, 3], now);
        expect(reminders.length).toBe(0);
    });
});

describe("detectExamConflicts()", () => {
    const examA: Exam = {
        ...validExamRaw,
        subject: "Math",
        date: new Date("2025-06-10T09:00:00.000Z"),
        earlyBirdDeadline: new Date(validExamRaw.earlyBirdDeadline),
        registrationDeadline: new Date(validExamRaw.registrationDeadline),
    };

    const examB: Exam = {
        ...validExamRaw,
        subject: "Ochrona systemów operacyjnych",
        date: new Date("2025-06-10T09:30:00.000Z"),
        earlyBirdDeadline: new Date(validExamRaw.earlyBirdDeadline),
        registrationDeadline: new Date(validExamRaw.registrationDeadline),
    };

    const examC: Exam = {
        ...validExamRaw,
        subject: "Chmury obliczeniowe",
        date: new Date("2025-06-10T11:00:00.000Z"),
        earlyBirdDeadline: new Date(validExamRaw.earlyBirdDeadline),
        registrationDeadline: new Date(validExamRaw.registrationDeadline),
    };

    it("should detect conflicts between overlapping exams", () => {
        const conflicts = detectExamConflicts([examA, examB]);
        expect(conflicts.length).toBe(1);
        expect(conflicts[0].overlapMinutes).toBeGreaterThan(0);
    });

    it("should not report conflicts if no overlaps exist", () => {
        const conflicts = detectExamConflicts([examA, examC]);
        expect(conflicts.length).toBe(0);
    });
});