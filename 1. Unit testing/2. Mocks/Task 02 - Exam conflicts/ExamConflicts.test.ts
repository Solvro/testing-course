import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ExamConflicts, type Exam, type ExamRaw } from './ExamConflicts';
import { db } from '../utils/db';

vi.mock("../utils/db");

describe('ExamConflicts tests', () => {
  let examConflicts: ExamConflicts;  
  const currentDate = new Date('2025-07-15').toISOString();
  let sampleRawExams: ExamRaw[];
  let sampleExams: Exam[];

  beforeEach(async () => {
    vi.setSystemTime(currentDate);
    examConflicts = new ExamConflicts();       
    sampleRawExams = [
      {
        id: 1,
        subject: "Mathematics",
        date: new Date("2025-07-20").toString(),
        durationMinutes: 120,
        location: "Room 101",
        fee: 150,
        earlyBirdDeadline: new Date("2025-06-15").toString(),
        registrationDeadline: new Date("2025-07-10").toString()
      },
      {
        id: 2,
        subject: "Physics",
        date: new Date("2025-07-22").toString(),
        durationMinutes: 90,
        location: "Room 202",
        fee: 120,
        earlyBirdDeadline: new Date("2025-06-18").toString(),
        registrationDeadline: new Date("2025-07-12").toString()
      }
    ];     
    sampleExams = await examConflicts.convertAllToExams(sampleRawExams);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return all exams', async () => {
    vi.mocked(db.sql).mockResolvedValue(sampleRawExams);
    const result = await examConflicts.getAllExams();
    expect(result).toEqual(sampleExams);
  });

  it('should return exam by ID', async () => {
    vi.mocked(db.sql).mockResolvedValue([sampleRawExams[0]]);
    const result = await examConflicts.getExamById(sampleRawExams[0].id);
    expect(result).toEqual(sampleExams[0]);
  });

  it("should throw an error when no exam is found", async () => {
    vi.mocked(db.sql).mockResolvedValue([]);
    await expect(examConflicts.getExamById(1)).rejects.toThrowError(/not found/i);
  });
});