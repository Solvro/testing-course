import { vi, it, expect, describe, beforeEach } from "vitest";
import { ExamConflicts } from "./ExamConflicts";
import { db } from "../utils/db";
import { createExamRaw } from "./testHelpers";

vi.mock("../utils/db");

describe("constructor", () => {
  it("should create instance of ExamConflicts", () => {
    vi.setSystemTime("2025-07-01");
    const instance = new ExamConflicts();
    expect(instance).toBeInstanceOf(ExamConflicts);
  });

  it("should throw an error because exams can be managed only in July", () => {
    vi.setSystemTime("2025-04-20");
    expect(() => new ExamConflicts()).toThrowError(/managed/i);
  });
});

describe("getExamById", () => {
  let examConflicts: ExamConflicts;
  const examId = 1;

  beforeEach(() => {
    vi.setSystemTime("2025-07-15");
    examConflicts = new ExamConflicts();
  });

  it("should throw an error because exam was not found", async () => {
    vi.mocked(db.sql).mockResolvedValue([]);
    await expect(examConflicts.getExamById(examId)).rejects.toThrowError(
      /not found/i
    );
  });

  it("should return exam with given ID", async () => {
    vi.mocked(db.sql).mockResolvedValue([createExamRaw({ id: examId })]);
    const result = await examConflicts.getExamById(examId);

    expect(result.id).toBe(examId);
  });

  it("should log warning when multiple exams found with same ID", async () => {
    vi.mocked(db.sql).mockResolvedValue([
      createExamRaw({ id: examId, subject: "First subject" }),
      createExamRaw({ id: examId, subject: "Second subject" }),
    ]);

    const consoleSpy = vi.spyOn(console, "warn");
    await examConflicts.getExamById(examId);

    expect(consoleSpy).toBeCalledWith(
      expect.stringMatching(/multiple exams found/i)
    );
  });

  it("should propagate database errors", async () => {
    const dbError = new Error("Database error");
    vi.mocked(db.sql).mockRejectedValue(dbError);
    await expect(examConflicts.getExamById(examId)).rejects.toThrow(dbError);
  });
});
