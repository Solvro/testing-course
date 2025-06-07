import { vi, it, expect, describe, beforeEach } from "vitest";
import { ExamConflicts, ExamRaw } from "./ExamConflicts";
import { db } from "../utils/db";

vi.mock("pg", () => {return { Pool: vi.fn()};});
vi.mock("../utils/db");

describe("scheduleExamReminders", () => {

    let examConflictsService: ExamConflicts
    let exams: ExamRaw[]

    beforeEach(() => {

        vi.setSystemTime("2025-07-01");

        examConflictsService = new ExamConflicts();

        exams = [
            {
                id: 1,
                subject: "Artificial Intelligence",
                date: "2025-07-30",
                durationMinutes: 60,
                location: "A-1",
                fee: 0.99,
                earlyBirdDeadline: "2025-07-20",
                registrationDeadline: "2025-07-10",

            },
            {
                id: 2,
                subject: "Data Warehouses",
                date: "2025-07-23",
                durationMinutes: 90,
                location: "C-13",
                fee: 9.99,
                earlyBirdDeadline: "2025-07-15",
                registrationDeadline: "2025-07-05",

            },
        ];

    });

    it("should return empty if no exams", async () => {
        
        vi.mocked(db.sql).mockResolvedValue([]);
        const days = [1, 3, 5];

        const response = await examConflictsService.scheduleExamReminders(days);
        
        expect(response).toHaveLength(0);

    });

    it("should return empty if no reminder dates", async () => {

        vi.mocked(db.sql).mockResolvedValue(exams);
        const days = [];

        const response = await examConflictsService.scheduleExamReminders(days);
        
        expect(response).toHaveLength(0);

    });
    
    it("should return a reminder for an exam if the reminder date has not yet occured", async () => {
        
        vi.mocked(db.sql).mockResolvedValue([exams[0]]);
        const days = [5];
        vi.setSystemTime("2025-07-21");
        
        const response = await examConflictsService.scheduleExamReminders(days);
        
        expect(response).toHaveLength(1);
        expect(response[0].subject).toEqual("Artificial Intelligence");
        expect(response[0].sendAt).toEqual(new Date("2025-07-25"));
        expect(response[0].message).toMatch(/reminder/i);
        expect(response[0].message).toMatch(/5 day/i);

    });

    it("should not return any reminders for an exam if the reminder date has already occured", async () => {
        
        vi.mocked(db.sql).mockResolvedValue([exams[0]]);
        const days = [5];
        vi.setSystemTime("2025-07-29");
        
        const response = await examConflictsService.scheduleExamReminders(days);
        
        expect(response).toHaveLength(0);
        
    });

    it("should only return upcoming reminders", async () => {
        
        vi.mocked(db.sql).mockResolvedValue([exams[0]]);
        const days = [5, 1];
        vi.setSystemTime("2025-07-28");
        
        const response = await examConflictsService.scheduleExamReminders(days);
        
        expect(response).toHaveLength(1);
        expect(response[0].sendAt).toEqual(new Date("2025-07-29"));
        expect(response[0].message).toMatch(/1 day/i);
        
    });

    it("should return reminders for multiple exams", async () => {
        
        vi.mocked(db.sql).mockResolvedValue(exams);
        const days = [1];
        vi.setSystemTime("2025-07-20");
        
        const response = await examConflictsService.scheduleExamReminders(days);
        
        expect(response).toHaveLength(2);
        expect(response[0].subject).toEqual("Data Warehouses");
        expect(response[1].subject).toEqual("Artificial Intelligence");
        
    });
    
    it("should return reminders ordered by date ascending", async () => {
        
        vi.mocked(db.sql).mockResolvedValue(exams);
        const days = [5, 1, 2];
        vi.setSystemTime("2025-07-20");
        
        const response = await examConflictsService.scheduleExamReminders(days);
        
        expect(response).toHaveLength(5);
        expect(response[0].subject).toEqual("Data Warehouses");
        expect(response[0].sendAt).toEqual(new Date("2025-07-21"));
        expect(response[4].subject).toEqual("Artificial Intelligence");
        expect(response[4].sendAt).toEqual(new Date("2025-07-29"));
        for (let i = 0; i < response.length - 1; i++) {
            expect(response[i].sendAt.getTime()).toBeLessThan(response[i + 1].sendAt.getTime());
        }
    });
    
});
