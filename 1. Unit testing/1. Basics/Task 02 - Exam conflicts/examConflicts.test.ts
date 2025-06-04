import { describe, expect, it } from "vitest";
import {
  canRegister,
  computeRegistrationFee,
  detectExamConflicts,
  Exam,
  ExamRaw,
  parseExamSchedule,
  scheduleExamReminders,
} from "./examConflicts";

const examRaw: ExamRaw = {
  subject: "Networking",
  date: "2025-06-11T15:00:00Z",
  durationMinutes: 90,
  location: "205 C-1",
  fee: 20,
  earlyBirdDeadline: "2025-06-05T00:00:00Z",
  registrationDeadline: "2025-06-10T09:00:00Z",
};

describe("parseExamSchedule", () => {
  it("should parse valid json", () => {
    const res = parseExamSchedule(JSON.stringify([examRaw]));
    console.log(JSON.stringify(examRaw));
    expect(res.length).toBe(1);
    expect(res[0].subject).toBe("Networking");
    expect(res[0].date).toBeInstanceOf(Date);
    expect(res[0].durationMinutes).toBe(90);
    expect(res[0].location).toBe("205 C-1");
    expect(res[0].fee).toBe(20);
    expect(res[0].earlyBirdDeadline).toBeInstanceOf(Date);
    expect(res[0].registrationDeadline).toBeInstanceOf(Date);
  });

  it("should throw an error on invalid json", () => {
    expect(() => parseExamSchedule("{lulnotvalidjson: true}")).toThrow(
      "Invalid JSON"
    );
  });

  it("should throw an error on non-array", () => {
    expect(() => parseExamSchedule(JSON.stringify(examRaw))).toThrow(
      "Expected an array of exams"
    );
  });

  it("should throw an error on missing fields", () => {
    expect(() => parseExamSchedule(JSON.stringify([{}]))).toThrow(
      "ExamRaw at index 0 missing/invalid fields: subject, date, durationMinutes, location, fee, earlyBirdDeadline, registrationDeadline"
    );
  });

  it("should throw an error on invalid date", () => {
    const badRaw = { ...examRaw, date: "2025-06-1115:00:00Z" };
    expect(() => parseExamSchedule(JSON.stringify([badRaw]))).toThrow(
      "Invalid date format"
    );
  });

  it("should throw an error on invalid earlyBirdDeadline", () => {
    const badRaw = { ...examRaw, earlyBirdDeadline: "2025-06-1115:00:00Z" };
    expect(() => parseExamSchedule(JSON.stringify([badRaw]))).toThrow(
      "Invalid earlyBirdDeadline"
    );
  });

  it("should throw an error on invalid date", () => {
    const badRaw = { ...examRaw, registrationDeadline: "2025-06-1115:00:00Z" };
    expect(() => parseExamSchedule(JSON.stringify([badRaw]))).toThrow(
      "Invalid registrationDeadline"
    );
  });

  it("should throw an error if earlyBirdDeadline after registrationDeadline", () => {
    const badRaw = { ...examRaw, earlyBirdDeadline: "2025-06-12T00:00:00Z" };
    expect(() => parseExamSchedule(JSON.stringify([badRaw]))).toThrow(
      "Early-bird deadline after registration deadline"
    );
  });

  it("should throw an error if registrationDeadline after date", () => {
    const badRaw = { ...examRaw, registrationDeadline: "2025-06-12T00:00:00Z" };
    expect(() => parseExamSchedule(JSON.stringify([badRaw]))).toThrow(
      "Registration deadline after exam date"
    );
  });
});

describe("canRegister", () => {
  const exam = parseExamSchedule(JSON.stringify([examRaw]))[0];

  it("should return true if before deadline", () => {
    expect(canRegister(exam, new Date("2025-06-01T09:00:00Z"))).toBe(true);
  });

  it("should return false if after deadline", () => {
    expect(canRegister(exam, new Date("2025-06-20T09:00:00Z"))).toBe(false);
  });
});

describe("computeRegistrationFee", () => {
  const exam = parseExamSchedule(JSON.stringify([examRaw]))[0];

  it("should apply early bird discount", () => {
    expect(computeRegistrationFee(exam, new Date("2025-06-01T00:00:00Z"))).toBe(
      16
    );
  });

  it("should apply a regular fee", () => {
    expect(computeRegistrationFee(exam, new Date("2025-06-08T00:00:00Z"))).toBe(
      20
    );
  });

  it("should throw an error if past registration", () => {
    expect(() =>
      computeRegistrationFee(exam, new Date("2025-06-10T11:00:00Z"))
    ).toThrow("Registration closed");
  });
});

describe("scheduleExamReminder", () => {
  const exam = parseExamSchedule(JSON.stringify([examRaw]))[0];

  it("should schedule valid reminder", () => {
    const reminders = scheduleExamReminders(
      [exam],
      [1, 3, 7],
      new Date("2025-05-01T15:00:00Z")
    );
    expect(reminders.length).toBe(3);
    expect(reminders[0].sendAt).toBeInstanceOf(Date);
    expect(reminders[0].message).toBe(
      'Reminder: your exam "Networking" is in 7 day(s).'
    );
  });

  it("should not include expired reminders", () => {
    const reminders = scheduleExamReminders(
      [exam],
      [1, 3, 7],
      new Date("2025-06-07T15:00:00Z")
    );
    expect(reminders.length).toBe(2);
    expect(reminders[0].sendAt).toBeInstanceOf(Date);
    expect(reminders[0].message).toBe(
      'Reminder: your exam "Networking" is in 3 day(s).'
    );
  });
});

describe("detectExamConflicts", () => {
  const examA: Exam = {
    ...parseExamSchedule(JSON.stringify([examRaw]))[0],
    subject: "exam A",
  };

  const examB: Exam = {
    ...examA,
    subject: "exam B",
    date: new Date(new Date(examA.date).getTime() + 30 * 60 * 1000), // overlap by 30 mins
  };

  const examC: Exam = {
    ...examA,
    subject: "exam C",
    date: new Date(new Date(examA.date).getDate() + 120 * 60 * 1000),
  };

  it("should return list of overlaping exams", () => {
    const res = detectExamConflicts([examA, examB]);
    expect(res.length).toBe(1);
    expect(res[0].overlapMinutes).toBe(60);
  });

  it("should return empty list if no overlaping exams", () => {
    const res = detectExamConflicts([examA, examC]);
    expect(res.length).toBe(0);
  });
});
