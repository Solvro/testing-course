import { describe, it, expect } from "vitest";
import {
  canRegister,
  computeRegistrationFee,
  detectExamConflicts,
  Exam,
  ExamRaw,
  parseExamSchedule,
  scheduleExamReminders,
} from "./examConflicts";

// Valid exam schedule for testing

describe("parseExamSchedule", () => {
  const validExamSchedule: ExamRaw = {
    subject: "The Bite",
    date: "1987-11-13T16:00:00Z",
    durationMinutes: 1,
    location: "The Party Room",
    fee: 0,
    earlyBirdDeadline: "1987-11-13T15:00:00Z",
    registrationDeadline: "1987-11-13T15:30:00Z",
  };
  it("should parse valid exam schedule", () => {
    expect(() => {
      parseExamSchedule(JSON.stringify([validExamSchedule]));
    }).not.toThrowError();
  });

  it("should throw error for invalid JSON", () => {
    expect(() => {
      parseExamSchedule("invalid json");
    }).toThrowError();
  });

  it("should throw error for non-array input", () => {
    expect(() => {
      parseExamSchedule("{}");
    }).toThrowError();
  });

  it("should throw error if subject is not a string", () => {
    const invalidExamSchedule = {
      ...validExamSchedule,
      subject: 123, // invalid type
    };
    expect(() => {
      parseExamSchedule(JSON.stringify([invalidExamSchedule]));
    }).toThrowError();
  });

  it("should throw error if date is not a valid ISO 8601 string", () => {
    const invalidExamSchedule = {
      ...validExamSchedule,
      date: "invalid-date", // invalid date format
    };
    expect(() => {
      parseExamSchedule(JSON.stringify([invalidExamSchedule]));
    }).toThrowError();
  });

  it("should throw error if durationMinutes is not a number", () => {
    const invalidExamSchedule = {
      ...validExamSchedule,
      durationMinutes: "one", // invalid type
    };
    expect(() => {
      parseExamSchedule(JSON.stringify([invalidExamSchedule]));
    }).toThrowError();
  });

  it("should throw error if durationMinutes is negative", () => {
    const invalidExamSchedule = {
      ...validExamSchedule,
      durationMinutes: -10, // negative duration
    };
    expect(() => {
      parseExamSchedule(JSON.stringify([invalidExamSchedule]));
    }).toThrowError();
  });

  it("should throw error if location is not a string", () => {
    const invalidExamSchedule = {
      ...validExamSchedule,
      location: 123, // invalid type
    };
    expect(() => {
      parseExamSchedule(JSON.stringify([invalidExamSchedule]));
    }).toThrowError();
  });

  it("should throw error if fee is not a number", () => {
    const invalidExamSchedule = {
      ...validExamSchedule,
      fee: "free", // invalid type
    };
    expect(() => {
      parseExamSchedule(JSON.stringify([invalidExamSchedule]));
    }).toThrowError();
  });

  it("should throw error if fee is negative", () => {
    const invalidExamSchedule = {
      ...validExamSchedule,
      fee: -10, // negative fee
    };
    expect(() => {
      parseExamSchedule(JSON.stringify([invalidExamSchedule]));
    }).toThrowError();
  });

  it("should throw error if earlyBirdDeadline is after registrationDeadline", () => {
    const invalidExamSchedule = {
      ...validExamSchedule,
      earlyBirdDeadline: "1987-11-13T16:00:00Z", // after registration deadline
    };
    expect(() => {
      parseExamSchedule(JSON.stringify([invalidExamSchedule]));
    }).toThrowError();
  });

  it("should throw error if registrationDeadline is after exam date", () => {
    const invalidExamSchedule = {
      ...validExamSchedule,
      registrationDeadline: "1987-11-13T17:00:00Z", // after exam date
    };
    expect(() => {
      parseExamSchedule(JSON.stringify([invalidExamSchedule]));
    }).toThrowError();
  });

  it("should parse valid exam schedule with multiple exams", () => {
    const validExamSchedules = [
      validExamSchedule,
      {
        subject: "Night 6",
        date: "1987-11-14T00:00:00Z",
        durationMinutes: 360,
        location: "Security Office",
        fee: 100.5,
        earlyBirdDeadline: "1987-11-13T15:00:00Z",
        registrationDeadline: "1987-11-13T15:30:00Z",
      },
    ];
    expect(() => {
      parseExamSchedule(JSON.stringify(validExamSchedules));
    }).not.toThrowError();
  });
});

describe("canRegister", () => {
  it("should return true if the registration deadline is in the future", () => {
    // Create a future exam date
    const examDate = new Date();
    examDate.setFullYear(examDate.getFullYear() + 1);
    // Set early bird and registration deadlines
    const earlyBirdDeadline = new Date(examDate);
    earlyBirdDeadline.setDate(earlyBirdDeadline.getDate() - 30);
    const registrationDeadline = new Date(examDate);
    registrationDeadline.setDate(registrationDeadline.getDate() - 1);
    // Create the exam object
    const exam: Exam = {
      subject: "Future Exam",
      date: examDate,
      durationMinutes: 120,
      location: "Future Room",
      fee: 50,
      earlyBirdDeadline: earlyBirdDeadline,
      registrationDeadline: registrationDeadline,
    };
    expect(canRegister(exam)).toBe(true);
  });

  it("should return false if the registration deadline is in the past", () => {
    // Create the exam object
    const exam: Exam = {
      subject: "Past Exam",
      date: new Date("2023-01-01T00:00:00Z"),
      durationMinutes: 120,
      location: "Past Room",
      fee: 50,
      earlyBirdDeadline: new Date("2022-12-01T00:00:00Z"),
      registrationDeadline: new Date("2022-12-30T23:59:59Z"),
    };
    expect(canRegister(exam)).toBe(false);
  });
});

describe("computeRegistrationFee", () => {
  it("should return discounted fee if before early bird deadline", () => {
    const now = new Date();
    const exam: Exam = {
      subject: "Early Bird Exam",
      date: new Date(now.getTime() + 1000 * 60 * 60 * 25),
      durationMinutes: 120,
      location: "Early Bird Room",
      fee: 100,
      earlyBirdDeadline: new Date(now.getTime() + 1000 * 60 * 60 * 23),
      registrationDeadline: new Date(now.getTime() + 1000 * 60 * 60 * 24),
    };
    expect(computeRegistrationFee(exam)).toBe(80); // 20% discount
  });

  it("should return full fee if before registration deadline but after early bird deadline", () => {
    const now = new Date();
    const exam: Exam = {
      subject: "Regular Exam",
      date: new Date(now.getTime() + 1000 * 60 * 60 * 25),
      durationMinutes: 120,
      location: "Regular Room",
      fee: 100,
      earlyBirdDeadline: new Date(now.getTime() - 1000 * 60 * 60 * 23),
      registrationDeadline: new Date(now.getTime() + 1000 * 60 * 60 * 24),
    };
    expect(computeRegistrationFee(exam)).toBe(100); // full fee
  });

  it("should throw error if after registration deadline", () => {
    const now = new Date();
    const exam: Exam = {
      subject: "Closed Exam",
      date: new Date(now.getTime() + 1000 * 60 * 60 * 25),
      durationMinutes: 120,
      location: "Closed Room",
      fee: 100,
      earlyBirdDeadline: new Date(now.getTime() - 1000 * 60 * 60 * 23),
      registrationDeadline: new Date(now.getTime() - 1000 * 60 * 60 * 1),
    };
    expect(() => computeRegistrationFee(exam)).toThrowError();
  });
});

describe("scheduleExamReminders", () => {
  const now = new Date("2025-06-25T00:00:00Z");

  it("should schedule reminders only if sendAt > now", () => {
    const exams: Exam[] = [
      {
        subject: "Exam 1",
        date: new Date("2025-07-01T10:00:00Z"),
        durationMinutes: 120,
        location: "Room A",
        fee: 50,
        earlyBirdDeadline: new Date("2025-06-20T10:00:00Z"),
        registrationDeadline: new Date("2025-06-25T10:00:00Z"),
      },
      {
        subject: "Exam 2",
        date: new Date("2025-07-05T10:00:00Z"),
        durationMinutes: 90,
        location: "Room B",
        fee: 75,
        earlyBirdDeadline: new Date("2025-06-22T10:00:00Z"),
        registrationDeadline: new Date("2025-06-30T10:00:00Z"),
      },
    ];
    const daysBefore = [1, 3, 7];
    const reminders = scheduleExamReminders(exams, daysBefore, now);
    expect(reminders.length).toBe(5);
  });

  it("should not schedule reminders for past exams", () => {
    const exams: Exam[] = [
      {
        subject: "Past Exam",
        date: new Date("2025-06-20T10:00:00Z"),
        durationMinutes: 120,
        location: "Room C",
        fee: 50,
        earlyBirdDeadline: new Date("2025-06-15T10:00:00Z"),
        registrationDeadline: new Date("2025-06-18T10:00:00Z"),
      },
    ];
    const daysBefore = [1, 3, 7];
    const reminders = scheduleExamReminders(exams, daysBefore, now);
    expect(reminders.length).toBe(0);
  });

  it("should return reminders sorted by sendAt ascending", () => {
    const exams: Exam[] = [
      {
        subject: "Exam 1",
        date: new Date("2025-07-01T10:00:00Z"),
        durationMinutes: 120,
        location: "Room A",
        fee: 50,
        earlyBirdDeadline: new Date("2025-06-20T10:00:00Z"),
        registrationDeadline: new Date("2025-06-25T10:00:00Z"),
      },
      {
        subject: "Exam 2",
        date: new Date("2025-07-05T10:00:00Z"),
        durationMinutes: 90,
        location: "Room B",
        fee: 75,
        earlyBirdDeadline: new Date("2025-06-22T10:00:00Z"),
        registrationDeadline: new Date("2025-06-30T10:00:00Z"),
      },
    ];
    const daysBefore = [1, 3, 7];
    const reminders = scheduleExamReminders(exams, daysBefore, now);
    expect(reminders).toEqual(
      reminders.sort((a, b) => a.sendAt.getTime() - b.sendAt.getTime())
    );
  });
});

describe("detectExamConflicts", () => {
  const baseExam = {
    subject: "Base Exam",
    date: new Date("2025-07-01T10:00:00Z"),
    durationMinutes: 60,
    location: "Room A",
    fee: 50,
    earlyBirdDeadline: new Date("2025-05-01T00:00:00Z"),
    registrationDeadline: new Date("2025-06-01T00:00:00Z"),
  };
  it("should return an empty array if there are no conflicts", () => {
    const exams: Exam[] = [
      { ...baseExam, subject: "Exam 1" },
      {
        ...baseExam,
        subject: "Exam 2",
        date: new Date("2025-07-01T11:00:00Z"),
      },
    ];
    expect(detectExamConflicts(exams)).toEqual([]);
  });

  it("should detect conflicts when exams overlap", () => {
    const exams: Exam[] = [
      { ...baseExam, subject: "Exam 1", durationMinutes: 120 },
      {
        ...baseExam,
        subject: "Exam 2",
        date: new Date("2025-07-01T11:00:00Z"), // overlaps with Exam 1
      },
    ];
    const conflicts = detectExamConflicts(exams);
    expect(conflicts.length).toBe(1);
    expect(conflicts[0].overlapMinutes).toBe(60); // 1 hour overlap
    expect(conflicts[0].examA).toEqual(exams[0]);
    expect(conflicts[0].examB).toEqual(exams[1]);
  });

  it("should detect multiple conflicts", () => {
    const exams: Exam[] = [
      { ...baseExam, subject: "Exam 1", durationMinutes: 120 },
      {
        ...baseExam,
        subject: "Exam 2",
        date: new Date("2025-07-01T11:00:00Z"), // overlaps with Exam 1
      },
      {
        ...baseExam,
        subject: "Exam 3",
        date: new Date("2025-07-01T09:30:00Z"), // overlaps with Exam 1
      },
    ];
    const conflicts = detectExamConflicts(exams);
    expect(conflicts.length).toBe(2);
  });
});
