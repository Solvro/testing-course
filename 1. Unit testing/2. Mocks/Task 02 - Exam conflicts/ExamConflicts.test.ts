import { describe, it, expect, beforeEach, vi } from "vitest";
import { ExamConflicts, ExamRaw } from "./ExamConflicts";
import { db } from "../utils/db";

vi.mock("../utils/db");

const rawExam: ExamRaw = {
  id: 1,
  subject: "Math",
  date: "2025-07-15T10:00:00Z",
  durationMinutes: 120,
  location: "Room 101",
  fee: 100,
  earlyBirdDeadline: "2025-06-30T23:59:59Z",
  registrationDeadline: "2025-07-15T23:59:59Z",
};

beforeEach(() => {
  vi.setSystemTime("2025-07-01T12:00:00.000Z");
  vi.clearAllMocks();
});

describe("Constructor - ExamConlficts", () => {
  it("should throw error - managed in july", () => {
    vi.setSystemTime("2025-06-01T12:00:00.000Z");
    expect(() => new ExamConflicts()).toThrow(/managed in july/i);
  });
  it("should return instance if in July", () => {
    vi.setSystemTime("2025-07-01T12:00:00.000Z");
    const examConflicts = new ExamConflicts();
    expect(examConflicts).toBeInstanceOf(ExamConflicts);
  });
});

describe("getAllExams", () => {
  it("should return an empty array if no exams found", async () => {
    vi.mocked(db.sql).mockResolvedValue([]);
    const examConflicts = new ExamConflicts();
    const exams = await examConflicts.getAllExams();
    expect(exams).toEqual([]);
  });
  it("should return an array with one exam", async () => {
    vi.mocked(db.sql).mockResolvedValue([rawExam]);
    const examConflicts = new ExamConflicts();
    const exams = await examConflicts.getAllExams();
    expect(exams).toHaveLength(1);
  });
});

describe("getExamById", () => {
  it("should return error if exam is not found", async () => {
    vi.mocked(db.sql).mockResolvedValue([]);
    const examConflicts = new ExamConflicts();
    await expect(examConflicts.getExamById(0)).rejects.toThrow(/not found/i);
  });

  it("should return raw exam", async () => {
    vi.mocked(db.sql).mockResolvedValue([rawExam]);
    const examConflicts = new ExamConflicts();
    const exam = await examConflicts.getExamById(rawExam.id);
    expect(exam).toMatchObject({
      id: rawExam.id,
    });
  });
});

describe("canRegister", () => {
  it("should return false if registration is closed for an exam", async () => {
    const closedExam: ExamRaw = {
      ...rawExam,
      registrationDeadline: "2024-07-15T23:59:59Z",
    };
    vi.mocked(db.sql).mockResolvedValue([closedExam]);
    const examConflicts = new ExamConflicts();
    const canRegister = await examConflicts.canRegister(closedExam.id);
    expect(canRegister).toBeFalsy();
  });

  it("should return true if registration is open for an exam", async () => {
    vi.mocked(db.sql).mockResolvedValue([rawExam]);
    const examConflicts = new ExamConflicts();
    const canRegister = await examConflicts.canRegister(rawExam.id);
    expect(canRegister).toBeTruthy();
  });
});
