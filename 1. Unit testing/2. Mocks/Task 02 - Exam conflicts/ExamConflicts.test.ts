import { describe, it, expect, vi, beforeAll } from "vitest";
import { db } from "../utils/db";
import { ExamConflicts, type ExamRaw } from "./ExamConflicts";

vi.mock("../utils/db.ts");
vi.setSystemTime(new Date("2025-07-01T00:00:00Z"));

const MOCKED_EXAMS: ExamRaw[] = [
  {
    id: 1,
    subject: "Math (early bird)",
    date: "2025-10-01T09:00:00Z",
    durationMinutes: 120,
    location: "Room 101",
    fee: 100,
    earlyBirdDeadline: "2025-09-01T00:00:00Z",
    registrationDeadline: "2025-09-15T00:00:00Z",
  },
  {
    id: 2,
    subject: "Physics (regular)",
    date: "2025-10-01T10:30:00Z",
    durationMinutes: 90,
    location: "Room 102",
    fee: 100,
    earlyBirdDeadline: "2025-05-05T00:00:00Z",
    registrationDeadline: "2025-09-20T00:00:00Z",
  },
  {
    id: 3,
    subject: "Chemistry (closed)",
    date: "2023-10-02T10:00:00Z",
    durationMinutes: 60,
    location: "Room 103",
    fee: 100,
    earlyBirdDeadline: "2023-05-10T00:00:00Z",
    registrationDeadline: "2023-09-25T00:00:00Z",
  },
];

function mockedDbSql(query: string, params?: unknown[]) {
  if (params == null) {
    return Promise.resolve(MOCKED_EXAMS);
  }
  return Promise.resolve(MOCKED_EXAMS.filter((exam) => exam.id === params[0]));
}

describe("ExamConflicts", () => {
  const examConflicts = new ExamConflicts();

  beforeAll(() => {
    vi.mocked(db.sql).mockImplementation(mockedDbSql);
  });

  it("should convert date fields", async () => {
    const exams = await examConflicts.getExams();
    expect(exams).toHaveLength(3);
    for (const exam of exams) {
      for (const field of [
        "date",
        "earlyBirdDeadline",
        "registrationDeadline",
      ]) {
        expect(exam[field]).toBeInstanceOf(Date);
      }
    }
  });

  it("should check if exam registration is open", async () => {
    await expect(examConflicts.canRegister(1)).resolves.toBe(true);
    await expect(examConflicts.canRegister(2)).resolves.toBe(true);
    await expect(examConflicts.canRegister(3)).resolves.toBe(false);
  });

  it("should provide a discount for early bird registration", async () => {
    const fee = await examConflicts.computeRegistrationFee(1);
    expect(fee).toBe(80);
  });

  it("should charge full fee for regular registration", async () => {
    const fee = await examConflicts.computeRegistrationFee(2);
    expect(fee).toBe(100);
  });

  it("should throw an error for closed registration", async () => {
    await expect(examConflicts.computeRegistrationFee(3)).rejects.toThrow(
      "Registration closed",
    );
  });

  it("should detect exam conflicts", async () => {
    const conflicts = await examConflicts.detectExamConflicts();
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].examA.subject).toBe(MOCKED_EXAMS[0].subject);
    expect(conflicts[0].examB.subject).toBe(MOCKED_EXAMS[1].subject);
  });
});
