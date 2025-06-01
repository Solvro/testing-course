// 1) Data Shapes
export interface ExamRaw {
  subject: string;
  date: string; // ISO string
  durationMinutes: number; // e.g. 90
  location: string;
  fee: number; // base fee in PLN
  earlyBirdDeadline: string; // ISO string
  registrationDeadline: string; // ISO string
}

export interface Exam {
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

// 2) parseExamSchedule
//   - JSON → Exam[]
//   - validate types & logical ordering of deadlines
export function parseExamSchedule(json: string): Exam[] {
  let arr: any;
  try {
    arr = JSON.parse(json);
  } catch {
    throw new Error("Invalid JSON");
  }
  if (!Array.isArray(arr)) {
    throw new Error("Expected an array of exams");
  }

  return arr.map((item, idx) => {
    // basic type checks
    const errs: string[] = [];
    if (typeof item.subject !== "string") errs.push("subject");
    if (typeof item.date !== "string") errs.push("date");
    if (typeof item.durationMinutes !== "number") errs.push("durationMinutes");
    if (typeof item.location !== "string") errs.push("location");
    if (typeof item.fee !== "number") errs.push("fee");
    if (typeof item.earlyBirdDeadline !== "string")
      errs.push("earlyBirdDeadline");
    if (typeof item.registrationDeadline !== "string")
      errs.push("registrationDeadline");
    if (errs.length) {
      throw new Error(
        `ExamRaw at index ${idx} missing/invalid fields: ${errs.join(", ")}`
      );
    }

    const dDate = new Date(item.date);
    const dEarly = new Date(item.earlyBirdDeadline);
    const dReg = new Date(item.registrationDeadline);
    if (isNaN(dDate.getTime())) {
      throw new Error(`Invalid date format at index ${idx}: ${item.date}`);
    }
    if (isNaN(dEarly.getTime())) {
      throw new Error(
        `Invalid earlyBirdDeadline at index ${idx}: ${item.earlyBirdDeadline}`
      );
    }
    if (isNaN(dReg.getTime())) {
      throw new Error(
        `Invalid registrationDeadline at index ${idx}: ${item.registrationDeadline}`
      );
    }

    // business rule: earlyBird <= registrationDeadline <= exam date
    if (dEarly.getTime() > dReg.getTime()) {
      throw new Error(
        `Early-bird deadline after registration deadline at index ${idx}`
      );
    }
    if (dReg.getTime() > dDate.getTime()) {
      throw new Error(`Registration deadline after exam date at index ${idx}`);
    }

    return {
      subject: item.subject,
      date: dDate,
      durationMinutes: item.durationMinutes,
      location: item.location,
      fee: item.fee,
      earlyBirdDeadline: dEarly,
      registrationDeadline: dReg,
    };
  });
}

// 3) canRegister
//    true if now ≤ registrationDeadline
export function canRegister(exam: Exam, now: Date = new Date()): boolean {
  return now.getTime() <= exam.registrationDeadline.getTime();
}

// 4) computeRegistrationFee
//    20% discount if before earlyBirdDeadline,
//    full fee if before registrationDeadline,
//    throws if too late.
export function computeRegistrationFee(
  exam: Exam,
  now: Date = new Date()
): number {
  if (now.getTime() <= exam.earlyBirdDeadline.getTime()) {
    return +(exam.fee * 0.8).toFixed(2);
  }
  if (now.getTime() <= exam.registrationDeadline.getTime()) {
    return +exam.fee.toFixed(2);
  }
  throw new Error("Registration closed");
}

// 5) scheduleExamReminders
//    for each exam and each daysBefore in the list,
//    compute sendAt = exam.date – daysBefore*24h,
//    only if sendAt > now
export function scheduleExamReminders(
  exams: Exam[],
  daysBefore: number[],
  now: Date = new Date()
): Reminder[] {
  const msPerDay = 24 * 60 * 60 * 1000;
  const out: Reminder[] = [];

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

// 6) detectExamConflicts
//    O(n²) scan: any two exams whose time windows overlap
export function detectExamConflicts(exams: Exam[]): Conflict[] {
  const conflicts: Conflict[] = [];
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
        const overlapMinutes = Math.floor((overlapEnd - overlapStart) / 60_000);
        conflicts.push({ examA: a, examB: b, overlapMinutes });
      }
    }
  }
  return conflicts;
}
