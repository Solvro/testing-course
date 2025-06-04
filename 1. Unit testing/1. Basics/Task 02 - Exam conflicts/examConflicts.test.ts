import { describe, it, expect } from 'vitest';
import {
  parseExamSchedule,
  canRegister,
  computeRegistrationFee,
  scheduleExamReminders,
  detectExamConflicts,
  Exam,
} from './examConflicts';

describe('parseExamSchedule', () => {
  it('should parse valid JSON exam schedule', () => {
    const json = `[
      {
        "subject": "Math",
        "date": "2024-06-01T10:00:00Z",
        "durationMinutes": 90,
        "location": "Room 101",
        "fee": 100,
        "earlyBirdDeadline": "2024-05-01T00:00:00Z",
        "registrationDeadline": "2024-05-15T00:00:00Z"
      }
    ]`;

    const result = parseExamSchedule(json);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      subject: 'Math',
      date: new Date('2024-06-01T10:00:00Z'),
      durationMinutes: 90,
      location: 'Room 101',
      fee: 100,
      earlyBirdDeadline: new Date('2024-05-01T00:00:00Z'),
      registrationDeadline: new Date('2024-05-15T00:00:00Z'),
    });
  });

  it('should throw error for invalid JSON', () => {
    expect(() => parseExamSchedule('invalid json')).toThrow('Invalid JSON');
  });

  it('should throw error for invalid exam data', () => {
    const json = `[
      {
        "subject": 123,
        "date": "2024-06-01T10:00:00Z",
        "durationMinutes": "90",
        "location": "Room 101",
        "fee": 100,
        "earlyBirdDeadline": "2024-05-01T00:00:00Z",
        "registrationDeadline": "2024-05-15T00:00:00Z"
      }
    ]`;

    expect(() => parseExamSchedule(json)).toThrow(/missing\/invalid fields/);
  });

  it('should throw error for invalid date ordering', () => {
    const json = `[
      {
        "subject": "Math",
        "date": "2024-05-01T10:00:00Z",
        "durationMinutes": 90,
        "location": "Room 101",
        "fee": 100,
        "earlyBirdDeadline": "2024-05-15T00:00:00Z",
        "registrationDeadline": "2024-05-01T00:00:00Z"
      }
    ]`;

    expect(() => parseExamSchedule(json)).toThrow(
      /Early-bird deadline after registration deadline/
    );
  });
});

describe('canRegister', () => {
  const exam: Exam = {
    subject: 'Math',
    date: new Date('2024-06-01T10:00:00Z'),
    durationMinutes: 90,
    location: 'Room 101',
    fee: 100,
    earlyBirdDeadline: new Date('2024-05-01T00:00:00Z'),
    registrationDeadline: new Date('2024-05-15T00:00:00Z'),
  };

  it('should return true if before registration deadline', () => {
    const now = new Date('2024-05-10T00:00:00Z');
    expect(canRegister(exam, now)).toBe(true);
  });

  it('should return false if after registration deadline', () => {
    const now = new Date('2024-05-16T00:00:00Z');
    expect(canRegister(exam, now)).toBe(false);
  });
});

describe('computeRegistrationFee', () => {
  const exam: Exam = {
    subject: 'Math',
    date: new Date('2024-06-01T10:00:00Z'),
    durationMinutes: 90,
    location: 'Room 101',
    fee: 100,
    earlyBirdDeadline: new Date('2024-05-01T00:00:00Z'),
    registrationDeadline: new Date('2024-05-15T00:00:00Z'),
  };

  it('should apply 20% discount before early bird deadline', () => {
    const now = new Date('2024-04-30T00:00:00Z');
    expect(computeRegistrationFee(exam, now)).toBe(80);
  });

  it('should charge full fee between early bird and registration deadline', () => {
    const now = new Date('2024-05-10T00:00:00Z');
    expect(computeRegistrationFee(exam, now)).toBe(100);
  });

  it('should throw error after registration deadline', () => {
    const now = new Date('2024-05-16T00:00:00Z');
    expect(() => computeRegistrationFee(exam, now)).toThrow(
      'Registration closed'
    );
  });
});

describe('scheduleExamReminders', () => {
  const exams: Exam[] = [
    {
      subject: 'Math',
      date: new Date('2024-06-01T10:00:00Z'),
      durationMinutes: 90,
      location: 'Room 101',
      fee: 100,
      earlyBirdDeadline: new Date('2024-05-01T00:00:00Z'),
      registrationDeadline: new Date('2024-05-15T00:00:00Z'),
    },
  ];

  it('should create reminders for future dates', () => {
    const now = new Date('2024-05-01T00:00:00Z');
    const daysBefore = [1, 7];
    const reminders = scheduleExamReminders(exams, daysBefore, now);

    expect(reminders).toHaveLength(2);
    expect(reminders[0].subject).toBe('Math');
    expect(reminders[0].message).toContain('7 day(s)');
    expect(reminders[1].message).toContain('1 day(s)');
  });

  it('should not create reminders for past dates', () => {
    const now = new Date('2024-06-02T00:00:00Z');
    const daysBefore = [1, 7];
    const reminders = scheduleExamReminders(exams, daysBefore, now);

    expect(reminders).toHaveLength(0);
  });
});

describe('detectExamConflicts', () => {
  it('should detect overlapping exams', () => {
    const exams: Exam[] = [
      {
        subject: 'Math',
        date: new Date('2024-06-01T10:00:00Z'),
        durationMinutes: 90,
        location: 'Room 101',
        fee: 100,
        earlyBirdDeadline: new Date('2024-05-01T00:00:00Z'),
        registrationDeadline: new Date('2024-05-15T00:00:00Z'),
      },
      {
        subject: 'Physics',
        date: new Date('2024-06-01T10:30:00Z'),
        durationMinutes: 120,
        location: 'Room 102',
        fee: 100,
        earlyBirdDeadline: new Date('2024-05-01T00:00:00Z'),
        registrationDeadline: new Date('2024-05-15T00:00:00Z'),
      },
    ];

    const conflicts = detectExamConflicts(exams);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].examA.subject).toBe('Math');
    expect(conflicts[0].examB.subject).toBe('Physics');
    expect(conflicts[0].overlapMinutes).toBe(60);
  });

  it('should not detect conflicts for non-overlapping exams', () => {
    const exams: Exam[] = [
      {
        subject: 'Math',
        date: new Date('2024-06-01T10:00:00Z'),
        durationMinutes: 90,
        location: 'Room 101',
        fee: 100,
        earlyBirdDeadline: new Date('2024-05-01T00:00:00Z'),
        registrationDeadline: new Date('2024-05-15T00:00:00Z'),
      },
      {
        subject: 'Physics',
        date: new Date('2024-06-01T12:00:00Z'),
        durationMinutes: 120,
        location: 'Room 102',
        fee: 100,
        earlyBirdDeadline: new Date('2024-05-01T00:00:00Z'),
        registrationDeadline: new Date('2024-05-15T00:00:00Z'),
      },
    ];

    const conflicts = detectExamConflicts(exams);
    expect(conflicts).toHaveLength(0);
  });
});
