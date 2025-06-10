import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { ExamConflicts, ExamRaw } from "./ExamConflicts";

vi.mock("../utils/db", () => ({
  db: {
    sql: vi.fn(),
  },
}));
import { db } from "../utils/db";

function mockSql() {
  return db.sql as ReturnType<typeof vi.fn>;
}

function setLocalTime(date: Date | string) {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(date));
}
function resetTime() {
  vi.useRealTimers();
}

const examRawSample: ExamRaw = {
  id: 1,
  subject: "Zwierzeta w fizyce kwantowej",
  date: "2023-07-20T10:00:00.000Z",
  durationMinutes: 90,
  location: "Room 101",
  fee: 100,
  earlyBirdDeadline: "2023-07-10T23:59:59.000Z",
  registrationDeadline: "2023-07-18T23:59:59.000Z",
};

const examRawSample2: ExamRaw = {
  id: 2,
  subject: "Reakcje frontendowe",
  date: "2023-07-20T11:00:00.000Z",
  durationMinutes: 60,
  location: "Room 102",
  fee: 120,
  earlyBirdDeadline: "2023-07-12T23:59:59.000Z",
  registrationDeadline: "2023-07-18T23:59:59.000Z",
};

beforeEach(() => {
  setLocalTime("2023-07-01T12:00:00.000Z");
  vi.clearAllMocks();
});
afterEach(() => {
  resetTime();
});

describe("ExamConflicts constructor", () => {
  it("should not return instance if not July (constructor throws)", () => {
    setLocalTime("2023-06-01T12:00:00.000Z");
    expect(() => new ExamConflicts()).toThrow(/only.*managed in july/i);
  });
  it("should return instance if July", () => {
    setLocalTime("2023-07-01T12:00:00.000Z");
    const ec = new ExamConflicts();
    expect(ec).toBeInstanceOf(ExamConflicts);
  });
});

describe("ExamConflicts.getExamById", () => {
  it("should return converted exam from getExamById", async () => {
    mockSql().mockResolvedValueOnce([examRawSample]);
    const ec = new ExamConflicts();
    const exam = await ec.getExamById(1);
    expect(exam.id).toBe(1);
    expect(exam.subject).toBe("Zwierzeta w fizyce kwantowej");
    expect(exam.date).toBeInstanceOf(Date);
  });

  it("should return correct error message if exam doesnt exist", async () => {
    mockSql().mockResolvedValueOnce([]);
    const ec = new ExamConflicts();
    await expect(ec.getExamById(999)).rejects.toThrow(/not found/i);
  });
});

describe("ExamConflicts.canRegister", () => {
  it("should return true from canRegister if before registrationDeadline", async () => {
    mockSql().mockResolvedValueOnce([examRawSample]);
    setLocalTime("2023-07-15T12:00:00.000Z");
    const ec = new ExamConflicts();
    const result = await ec.canRegister(1);
    expect(result).toBe(true);
  });

  it("should return false from canRegister if after registrationDeadline", async () => {
    mockSql().mockResolvedValueOnce([examRawSample]);
    setLocalTime("2023-07-19T12:00:00.000Z");
    const ec = new ExamConflicts();
    const result = await ec.canRegister(1);
    expect(result).toBe(false);
  });
});

describe("ExamConflicts.computeRegistrationFee", () => {
  it("should return discounted fee from computeRegistrationFee before earlyBirdDeadline", async () => {
    mockSql().mockResolvedValueOnce([examRawSample]);
    setLocalTime("2023-07-05T12:00:00.000Z");
    const ec = new ExamConflicts();
    const fee = await ec.computeRegistrationFee(1);
    expect(fee).toBe(80);
  });

  it("should return full fee from computeRegistrationFee before registrationDeadline", async () => {
    mockSql().mockResolvedValueOnce([examRawSample]);
    setLocalTime("2023-07-15T12:00:00.000Z");
    const ec = new ExamConflicts();
    const fee = await ec.computeRegistrationFee(1);
    expect(fee).toBe(100);
  });

  it("should not return fee from computeRegistrationFee after registrationDeadline (should throw)", async () => {
    mockSql().mockResolvedValueOnce([examRawSample]);
    setLocalTime("2023-07-19T12:00:00.000Z");
    const ec = new ExamConflicts();
    await expect(ec.computeRegistrationFee(1)).rejects.toThrow("Registration closed");
  });
});

describe("ExamConflicts.scheduleExamReminders", () => {
  it("should return reminders only for future sendAt from scheduleExamReminders", async () => {
    mockSql().mockResolvedValueOnce([examRawSample]);
    setLocalTime("2023-07-01T12:00:00.000Z");
    const ec = new ExamConflicts();
    const reminders = await ec.scheduleExamReminders([10, 1]);
    expect(reminders.length).toBe(2);
    expect(reminders[0].sendAt < reminders[1].sendAt).toBe(true);
    expect(reminders[0].subject).toBe("Zwierzeta w fizyce kwantowej");
  });
});

describe("ExamConflicts.detectExamConflicts", () => {
  it("should return overlapping exams from detectExamConflicts", async () => {
    mockSql().mockResolvedValueOnce([examRawSample, examRawSample2]);
    const ec = new ExamConflicts();
    const conflicts = await ec.detectExamConflicts();
    expect(conflicts.length).toBe(1);
    expect(conflicts[0].overlapMinutes).toBe(30);
    expect(conflicts[0].examA.subject).toBe("Zwierzeta w fizyce kwantowej");
    expect(conflicts[0].examB.subject).toBe("Reakcje frontendowe");
  });
});
