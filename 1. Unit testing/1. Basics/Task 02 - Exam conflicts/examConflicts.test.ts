import { Exam, canRegister, detectExamConflicts, scheduleExamReminders } from "./examConflicts";
import { describe, it, expect, beforeEach } from "vitest";

const someExam: Exam = {
    subject: "Bazy Danych",
    date: new Date("2025-04-01T10:00:00Z"),
    durationMinutes: 120,
    location: "Sala 101",
    fee: 50,
    earlyBirdDeadline: new Date("2025-03-01T00:00:00Z"),
    registrationDeadline: new Date("2025-03-15T00:00:00Z"),
}

describe("ExamConflicts - can register", () => {
    const exam: Exam = { ...someExam }
    it("should be able to register"), () => {
        const now = new Date("2025-03-04T00:00:00Z");
        expect(canRegister(exam, now)).toBe(true);
    }
    it("should not be able to register after registration deadline", () => {
        const now = new Date("2025-03-16T00:00:00Z");
        expect(canRegister(exam, now)).toBe(false);
    });
})

describe("ExamConflicts - detect conflicts", () => {
    let examA: Exam = { ...someExam };
    let examB: Exam = {
        ...someExam,
        subject: "Algorytmy i Struktury Danych",
        date: new Date("2025-04-01T11:00:00Z"),
    };
    let examC: Exam = {
        ...someExam,
        subject: "Jezyki Skryptowe",
        date: new Date("2025-04-03T09:00:00Z"),
    };
    it("should detect conflict", () => {
        const conflicts = detectExamConflicts([examA, examB, examC]);
        expect(conflicts.length).toBe(1);
        expect(conflicts[0].overlapMinutes).toBe(60);
    });
    it("should not detect conflict when no exams overlap", () => {
        const conflicts = detectExamConflicts([examA, examC]);
        expect(conflicts.length).toBe(0);
    });
})

describe("ExamConflicts - schedule Exam Reminders", () => {
    const exam: Exam = { ...someExam };
    const now = new Date("2025-03-25T00:00:00Z");

    it("should schedule reminders correctly", () => {
        const reminders = scheduleExamReminders([exam], [1], now);
        expect(reminders.length).toBe(1);
    });
    it("should not schedule reminders for past dates", () => {
        const reminders = scheduleExamReminders([exam], [30], now);
        expect(reminders.length).toBe(0);
    });
})
