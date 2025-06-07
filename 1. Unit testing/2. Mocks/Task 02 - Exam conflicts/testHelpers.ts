import { ExamRaw } from "./ExamConflicts";

export function createExamRaw(overrides: Partial<ExamRaw> = {}) {
  return {
    id: 1,
    subject: "Mathematics",
    date: new Date().toISOString(),
    durationMinutes: 90,
    location: "Main Hall",
    fee: 200,
    earlyBirdDeadline: new Date("2025-06-13").toISOString(), // 7 days from now
    registrationDeadline: new Date("2025-06-20").toISOString(), // 14 days from now,
    ...overrides,
  } as ExamRaw;
}
