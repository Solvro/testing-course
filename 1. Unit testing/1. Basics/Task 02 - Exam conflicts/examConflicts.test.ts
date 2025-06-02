import { describe, it, expect, beforeEach } from "vitest";
import {
  parseExamSchedule,
  computeRegistrationFee,
  detectExamConflicts,
  type Exam,
} from "./examConflicts";

describe("parseExamSchedule", () => {
  it("should parse valid JSON and handle invalid JSON errors", () => {
    const validJson = JSON.stringify([
      {
        subject: "Algebra Liniowa 1",
        date: "2025-07-15T10:00:00.000Z",
        durationMinutes: 90,
        location: "D2.1",
        fee: 100,
        earlyBirdDeadline: "2025-06-15T23:59:59.000Z",
        registrationDeadline: "2025-07-01T23:59:59.000Z",
      },
    ]);

    const result = parseExamSchedule(validJson);

    expect(result).toHaveLength(1);
    expect(result[0].subject).toBe("Algebra Liniowa 1");
    expect(result[0].date).toBeInstanceOf(Date);
    expect(result[0].fee).toBe(100);

    const invalidJson = "{ invalid json";
    expect(() => parseExamSchedule(invalidJson)).toThrow("Invalid JSON");
  });
});

describe("computeRegistrationFee", () => {
  let mockExam: Exam;

  beforeEach(() => {
    mockExam = {
      subject: "Algorytmy i złożoność obliczeniowa",
      date: new Date("2025-07-15T10:00:00.000Z"),
      durationMinutes: 90,
      location: "327",
      fee: 100,
      earlyBirdDeadline: new Date("2025-06-15T23:59:59.000Z"),
      registrationDeadline: new Date("2025-07-01T23:59:59.000Z"),
    };
  });

  it("should handle all fee calculation scenarios", () => {
    // promo - before early bird
    const beforeEarlyBird = new Date("2025-06-10T12:00:00.000Z");
    expect(computeRegistrationFee(mockExam, beforeEarlyBird)).toBe(80);

    // full price
    const afterEarlyBird = new Date("2025-06-20T12:00:00.000Z");
    expect(computeRegistrationFee(mockExam, afterEarlyBird)).toBe(100);

    // big L for you - after registration deadline
    const afterRegistration = new Date("2025-07-02T00:00:01.000Z");
    expect(() => computeRegistrationFee(mockExam, afterRegistration)).toThrow(
      "Registration closed"
    );
  });
});

describe("detectExamConflicts", () => {
  it("should detect exam conflicts correctly", () => {
    const noConflictExams: Exam[] = [
      {
        subject: "Sieci komputerowe",
        date: new Date("2025-07-15T10:00:00.000Z"),
        durationMinutes: 90,
        location: "019a",
        fee: 100,
        earlyBirdDeadline: new Date("2025-06-15T23:59:59.000Z"),
        registrationDeadline: new Date("2025-07-01T23:59:59.000Z"),
      },
      {
        subject: "Bazy danych 1",
        date: new Date("2025-07-15T14:00:00.000Z"),
        durationMinutes: 90,
        location: "215",
        fee: 120,
        earlyBirdDeadline: new Date("2025-06-15T23:59:59.000Z"),
        registrationDeadline: new Date("2025-07-01T23:59:59.000Z"),
      },
    ];
    expect(detectExamConflicts(noConflictExams)).toHaveLength(0);

    const conflictExams: Exam[] = [
      {
        subject: "Sieci komputerowe",
        date: new Date("2025-07-15T10:00:00.000Z"),
        durationMinutes: 120,
        location: "019a",
        fee: 100,
        earlyBirdDeadline: new Date("2025-06-15T23:59:59.000Z"),
        registrationDeadline: new Date("2025-07-01T23:59:59.000Z"),
      },
      {
        subject: "Bazy danych 1",
        date: new Date("2025-07-15T11:00:00.000Z"),
        durationMinutes: 90,
        location: "215",
        fee: 120,
        earlyBirdDeadline: new Date("2025-06-15T23:59:59.000Z"),
        registrationDeadline: new Date("2025-07-01T23:59:59.000Z"),
      },
    ];

    const conflicts = detectExamConflicts(conflictExams);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].examA.subject).toBe("Sieci komputerowe");
    expect(conflicts[0].examB.subject).toBe("Bazy danych 1");
    expect(conflicts[0].overlapMinutes).toBe(60);
  });
});
