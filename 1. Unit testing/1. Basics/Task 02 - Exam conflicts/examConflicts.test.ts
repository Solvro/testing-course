import { describe, it, expect } from "vitest";
import { canRegister, Exam } from "./examConflicts";

describe("canRegister", () => {
  it.each([
    {
      scenario: "Exam has ended",
      deadline: new Date("2000-01-01T10:00:00.000Z"),
      currentDate: new Date("2001-01-01T10:00:00.000Z"),
      result: false,
    },
    {
      scenario: "Exam will be in the future",
      deadline: new Date("2001-01-01T10:00:00.000Z"),
      currentDate: new Date("2000-01-01T10:00:00.000Z"),
      result: true,
    },
  ])("$scenario", ({ deadline, currentDate, result }) => {
    const exam = {
      subject: "test",
      date: new Date(),
      durationMinutes: 20,
      location: "elo zelo",
      fee: 200,
      earlyBirdDeadline: new Date(),
      registrationDeadline: deadline,
    } satisfies Exam;
    expect(canRegister(exam, currentDate)).toBe(result);
  });
});
