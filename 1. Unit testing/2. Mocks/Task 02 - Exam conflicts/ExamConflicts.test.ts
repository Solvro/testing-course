import { vi, describe, it, expect, beforeEach } from "vitest";
import { ExamConflicts, ExamRaw } from "./ExamConflicts";
import { db } from "../utils/db";

vi.mock("../utils/db");

const MOCK_EXAM: ExamRaw = {
  id: 420,
  date: "2025-07-16",
  durationMinutes: 60,
  fee: 5,
  location: "C-13",
  subject: "Algorithms",
  earlyBirdDeadline: "2025-07-12",
  registrationDeadline: "2025-07-14",
};

describe("[ExamConflicts]:[constructor]", () => {
  it("should throw an exception caused by setting non-july month", () => {
    vi.setSystemTime(new Date("2025-05-01"));
    expect(() => new ExamConflicts()).toThrowError(/only be managed in July/);
  });

  it("should create an instance by setting july month", () => {
    vi.setSystemTime(new Date("2025-07-01"));
    const exams = new ExamConflicts();
    expect(exams).toBeInstanceOf(ExamConflicts);
  });
});

describe("[ExamConflicts]:[getExamById]", () => {
  let exams;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.setSystemTime(new Date("2025-07-01"));
    exams = new ExamConflicts();
  });

  it("should throw an error if exam with passed ID doesn't exist in db", async () => {
    vi.mocked(db.sql).mockResolvedValue([]);
    await expect(exams.getExamById(1)).rejects.toThrow(/not found/);
  });

  it("should return an exam with passed ID", async () => {
    vi.mocked(db.sql).mockResolvedValue([
      MOCK_EXAM,
      { ...MOCK_EXAM, id: 0 },
      { ...MOCK_EXAM, id: -1 },
    ]);

    const exam = await exams.getExamById(MOCK_EXAM.id);
    expect(exam).toMatchObject({ id: MOCK_EXAM.id });
  });
});
