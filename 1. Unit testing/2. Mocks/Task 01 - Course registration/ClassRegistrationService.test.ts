import { afterEach, beforeEach, describe, expect, it, Mock, vi } from "vitest";
import { db } from "../utils/db";
import { CourseRegistrationService } from "./ClassRegistrationService.js";

vi.mock("../utils/db", () => ({
    db: {
        sql: vi.fn(),
    },
}));

beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-02-01T00:00:00Z"));
});

afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
});

describe("CourseRegistrationService", () => {
    let registrationService: CourseRegistrationService;

    beforeEach(() => {
        registrationService = new CourseRegistrationService();
    });

    it("should successfully register a student for a valid course", async () => {
        const exampleStudent = {
            id: "student-1",
            name: "Kamil Ramocki",
            completedCourses: [],
            currentCourses: [],
            maxCreditHours: 6,
        };

        const exampleCourse = {
            id: "course-1",
            code: "IS",
            name: "Informatyka Śledcza",
            creditHours: 3,
            availableSeats: 1,
            prerequisites: [],
            schedule: [
                {
                    day: "Monday",
                    startTime: "7:30",
                    endTime: "9:00",
                    location: "Sala zdalna W4N",
                },
            ],
        };

        (db.sql as Mock).mockImplementation((query: string) => {
            if (query.includes("FROM students")) return Promise.resolve([exampleStudent]);
            if (query.includes("FROM courses")) return Promise.resolve([exampleCourse]);
            return Promise.resolve([]);
        });

        const result = await registrationService.registerForCourse("student-1", "course-1");

        expect(result.success).toBe(true);
        expect(result.message).toBe("Successfully registered for IS");
        expect(result.registeredCourse?.code).toBe("IS");
    });

    it("should return error when student is not found in the system", async () => {
        (db.sql as Mock).mockImplementation((query: string) => {
            if (query.includes("FROM students")) return Promise.resolve([]);
            return Promise.resolve([]);
        });

        const result = await registrationService.registerForCourse("nonexistent-student", "course-1");

        expect(result.success).toBe(false);
        expect(result.message).toBe("Student with ID nonexistent-student not found");
    });

    it("should return error when course is not found in the system", async () => {
        const student = {
            id: "student-2",
            name: "Piotr Hirkyj",
            completedCourses: [],
            currentCourses: [],
            maxCreditHours: 6,
        };

        (db.sql as Mock).mockImplementation((query: string) => {
            if (query.includes("FROM students")) return Promise.resolve([student]);
            if (query.includes("FROM courses")) return Promise.resolve([]);
            return Promise.resolve([]);
        });

        const result = await registrationService.registerForCourse("student-2", "nonexistent-course");

        expect(result.success).toBe(false);
        expect(result.message).toBe("Course with ID nonexistent-course not found");
    });

    it("should return error when student is missing required prerequisites", async () => {
        const student = {
            id: "student-3",
            name: "Kamil Ramocki",
            completedCourses: [],
            currentCourses: [],
            maxCreditHours: 6,
        };

        const prerequisiteCourse = {
            id: "course-2",
            code: "SK2",
            name: "Sieci Komputerowe 2",
            creditHours: 3,
            availableSeats: 10,
            prerequisites: [],
            schedule: [],
        };

        const advancedCourse = {
            id: "course-3",
            code: "SK3",
            name: "Sieci Komputerowe 3",
            creditHours: 3,
            availableSeats: 1,
            prerequisites: ["course-2"],
            schedule: [],
        };

        (db.sql as Mock).mockImplementation((query: string, params?: any[]) => {
            if (query.includes("FROM students")) return Promise.resolve([student]);

            if (query.includes("FROM courses WHERE id = $1")) {
                if (params?.[0] === "course-2") return Promise.resolve([prerequisiteCourse]);
                if (params?.[0] === "course-3") return Promise.resolve([advancedCourse]);
            }

            return Promise.resolve([]);
        });

        const result = await registrationService.registerForCourse("student-3", "course-3");

        expect(result.success).toBe(false);
        expect(result.message).toContain("Missing prerequisites: SK2");
    });

    it("should successfully register when prerequisites are completed", async () => {
        const student = {
            id: "student-4",
            name: "Kamil Ramocki",
            completedCourses: ["course-4"],
            currentCourses: [],
            maxCreditHours: 6,
        };

        const prerequisiteCourse = {
            id: "course-4",
            code: "SK2",
            name: "Sieci Komputerowe 2",
            creditHours: 3,
            availableSeats: 10,
            prerequisites: [],
            schedule: [],
        };

        const advancedCourse = {
            id: "course-5",
            code: "SK3",
            name: "Sieci Komputerowe 3",
            creditHours: 3,
            availableSeats: 1,
            prerequisites: ["course-4"],
            schedule: [],
        };

        (db.sql as Mock).mockImplementation((query: string, params?: any[]) => {
            if (query.includes("FROM students")) return Promise.resolve([student]);

            if (query.includes("FROM courses WHERE id = $1")) {
                if (params?.[0] === "course-4") return Promise.resolve([prerequisiteCourse]);
                if (params?.[0] === "course-5") return Promise.resolve([advancedCourse]);
            }

            if (query.includes("FROM courses")) {
                return Promise.resolve([prerequisiteCourse, advancedCourse]);
            }

            return Promise.resolve([]);
        });

        const result = await registrationService.registerForCourse("student-4", "course-5");

        expect(result.success).toBe(true);
        expect(result.message).toBe("Successfully registered for SK3");
        expect(result.registeredCourse?.code).toBe("SK3");
    });

});