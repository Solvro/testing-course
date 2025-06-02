// 1) Data Shapes
import { db } from "../utils/db";

export interface ExamRaw {
  id: number;
  subject: string;
  date: string; // ISO string
  durationMinutes: number; // e.g. 90
  location: string;
  fee: number; // base fee in PLN
  earlyBirdDeadline: string; // ISO string
  registrationDeadline: string; // ISO string
}

export interface Exam {
  id: number;
  subject: string;
  date: Date;
  durationMinutes: number;
  location: string;
  fee: number;
  earlyBirdDeadline: Date;
  registrationDeadline: Date;
}

export interface Reminder {
  subject: string;
  sendAt: Date;
  message: string;
}

export interface Conflict {
  examA: Exam;
  examB: Exam;
  overlapMinutes: number;
}

export class ExamConflicts {
  constructor() {
    const now = new Date();

    // NIE USUWAĆ TEGO - poradź sobie mockami :3
    if (now.getMonth() !== 6) {
      throw new Error("Exams can only be managed in July");
    }
  }

  /**
   * Fetch an exam by its ID
   */
  async getExamById(id: number): Promise<Exam> {
    const result = await db.sql("SELECT * FROM exams WHERE id = $1", [id]);

    if (result.length === 0) {
      throw new Error(`Exam with ID ${id} not found`);
    }

    const examRaw = result[0] as ExamRaw;
    return this.convertToExam(examRaw);
  }

  /**
   * Get all exams from the database
   */
  async getAllExams(): Promise<Exam[]> {
    const result = await db.sql("SELECT * FROM exams");
    return result.map((examRaw) => this.convertToExam(examRaw as ExamRaw));
  }

  /**
   * Convert an ExamRaw to an Exam
   */
  private convertToExam(examRaw: ExamRaw): Exam {
    return {
      id: examRaw.id,
      subject: examRaw.subject,
      date: new Date(examRaw.date),
      durationMinutes: examRaw.durationMinutes,
      location: examRaw.location,
      fee: examRaw.fee,
      earlyBirdDeadline: new Date(examRaw.earlyBirdDeadline),
      registrationDeadline: new Date(examRaw.registrationDeadline),
    };
  }

  /**
   * Get a copy of all exams
   */
  async getExams(): Promise<Exam[]> {
    return await this.getAllExams();
  }

  /**
   * Check if registration is still open for an exam
   * true if now ≤ registrationDeadline
   */
  async canRegister(examId: number): Promise<boolean> {
    const exam = await this.getExamById(examId);
    return new Date().getTime() <= exam.registrationDeadline.getTime();
  }

  /**
   * Compute registration fee for an exam
   * 20% discount if before earlyBirdDeadline,
   * full fee if before registrationDeadline,
   * throws if too late.
   */
  async computeRegistrationFee(examId: number): Promise<number> {
    const exam = await this.getExamById(examId);
    const now = new Date();
    if (now.getTime() <= exam.earlyBirdDeadline.getTime()) {
      return +(exam.fee * 0.8).toFixed(2);
    }
    if (now.getTime() <= exam.registrationDeadline.getTime()) {
      return +exam.fee.toFixed(2);
    }
    throw new Error("Registration closed");
  }

  /**
   * Schedule reminders for all exams
   * for each exam and each daysBefore in the list,
   * compute sendAt = exam.date – daysBefore*24h,
   * only if sendAt > now
   */
  async scheduleExamReminders(daysBefore: number[]): Promise<Reminder[]> {
    const msPerDay = 24 * 60 * 60 * 1000;
    const out: Reminder[] = [];
    const now = new Date();

    const exams = await this.getAllExams();

    for (const ex of exams) {
      for (const db of daysBefore) {
        const sendAt = new Date(ex.date.getTime() - db * msPerDay);
        if (sendAt.getTime() > now.getTime()) {
          out.push({
            subject: ex.subject,
            sendAt,
            message: `Reminder: your exam "${ex.subject}" is in ${db} day(s).`,
          });
        }
      }
    }

    // sort by sendAt ascending
    return out.sort((a, b) => a.sendAt.getTime() - b.sendAt.getTime());
  }

  /**
   * Detect conflicts between exams
   * O(n²) scan: any two exams whose time windows overlap
   */
  async detectExamConflicts(): Promise<Conflict[]> {
    const conflicts: Conflict[] = [];
    const exams = await this.getAllExams();

    for (let i = 0; i < exams.length; i++) {
      const a = exams[i];
      const aStart = a.date.getTime();
      const aEnd = aStart + a.durationMinutes * 60_000;

      for (let j = i + 1; j < exams.length; j++) {
        const b = exams[j];
        const bStart = b.date.getTime();
        const bEnd = bStart + b.durationMinutes * 60_000;

        const overlapStart = Math.max(aStart, bStart);
        const overlapEnd = Math.min(aEnd, bEnd);
        if (overlapEnd > overlapStart) {
          const overlapMinutes = Math.floor(
            (overlapEnd - overlapStart) / 60_000
          );
          conflicts.push({ examA: a, examB: b, overlapMinutes });
        }
      }
    }
    return conflicts;
  }
}
