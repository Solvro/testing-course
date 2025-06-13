import { db } from "../utils/db";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { Course, CourseRegistrationService, Student } from "./ClassRegistrationService";

vi.mock("../utils/db", () => ({
    db: {
        sql: vi.fn(),
    },
}));

const mockDate = new Date(2025, 1, 15);
vi.spyOn(global, "Date").mockImplementation(() => mockDate);

describe("ClassRegistrationService - register For Course", () => {
    let service: CourseRegistrationService;
    let studentData: Student;
    let courseData: Course;
    let anotherCourseData: Course;

    beforeEach(() => {
        vi.clearAllMocks();
        service = new CourseRegistrationService();
        studentData = {
            id: "student-123",
            name: "John Doe",
            completedCourses: ["course-0"],
            currentCourses: [],
            maxCreditHours: 30,
        }

        courseData = {
            id: "course-1",
            code: "CS101",
            name: "Bazy Danych",
            creditHours: 5,
            availableSeats: 10,
            prerequisites: ["course-0"],
            schedule: [
                {
                    day: "Monday",
                    startTime: "10:00",
                    endTime: "12:30",
                    location: "Room 101",
                },
            ],
        };

        anotherCourseData = {
            id: "course-3",
            code: "CS103",
            name: "Algorytmy i Struktury Danych",
            creditHours: 5,
            availableSeats: 10,
            prerequisites: ["course-1"],
            schedule: [
                {
                    day: "Tuesday",
                    startTime: "10:00",
                    endTime: "12:30",
                    location: "Room 104",

                },
            ],
        };
    });

    it("should register a student for a course with prerequisites", async () => {
        (db.sql as any)
            .mockResolvedValueOnce([studentData])
            .mockResolvedValueOnce([courseData])
            .mockResolvedValueOnce(undefined)
            .mockResolvedValueOnce(undefined);

        const result = await service.registerForCourse("student-123", "course-1");
        expect(result.success).toBe(true);
        expect(result.message).toMatch("Successfully registered for CS101");
        expect(result.registeredCourse).toEqual(expect.objectContaining({ id: "course-1", availableSeats: 9 }));
    })

    it("should not register a student that doesn't exist", async () => {
        (db.sql as any)
            .mockResolvedValueOnce([])

        const result = await service.registerForCourse("S_NonExistent", "course-1");

        expect(result.success).toBe(false);
        expect(result.message).toMatch("Student with ID S_NonExistent not found");
        expect(result.registeredCourse).toBeUndefined();

    })

    it("should not register a student for a course that doesn't exist", async () => {
        (db.sql as any)
            .mockResolvedValueOnce([studentData])
            .mockResolvedValueOnce([]);

        const result = await service.registerForCourse("student-123", "Course_NonExistent");
        expect(result.success).toBe(false);
        expect(result.message).toMatch(/Course with ID Course_NonExistent not found/i);
        expect(result.registeredCourse).toBeUndefined();
    });

    it("should not register a student for a course if they haven't completed prerequisites", async () => {
        (db.sql as any)
            .mockResolvedValueOnce([studentData])
            .mockResolvedValueOnce([anotherCourseData])
            .mockResolvedValueOnce([courseData]);

        const result = await service.registerForCourse("student-123", "course-3");
        expect(result.success).toBe(false);
        expect(result.message).toBe("Missing prerequisites: CS101");
        expect(result.registeredCourse).toBeUndefined();
    });

    it("should not register a student if they are already registered for the course", async () => {
        const studentAlreadyRegistered = {
            ...studentData,
            currentCourses: [courseData.id],
        };

        (db.sql as any)
            .mockResolvedValueOnce([studentAlreadyRegistered])
            .mockResolvedValueOnce([courseData]);

        const result = await service.registerForCourse(studentData.id, courseData.id);
        expect(result.success).toBe(false);
        expect(result.message).toMatch(/Student is already registered for CS101/i);
        expect(result.registeredCourse).toBeUndefined();
    });

    it("should not register a student if the course overlaps with another", async () => {
        const overlappingCourse = {
            ...courseData,
            schedule: [
                {
                    day: "Monday",
                    startTime: "10:00",
                    endTime: "12:30",
                    location: "Room 102",
                },
            ],
            id: "course-4",
        };

        const studentWithOverlappingCourse = {
            ...studentData,
            currentCourses: ["course-4"],
        };

        (db.sql as any)
            .mockResolvedValueOnce([studentWithOverlappingCourse])
            .mockResolvedValueOnce([courseData])
            .mockResolvedValueOnce([overlappingCourse]);

        const result = await service.registerForCourse("student-123", "course-3");
        expect(result.success).toBe(false);
        expect(result.message).toMatch("Schedule conflict detected with course CS101");
        expect(result.registeredCourse).toBeUndefined();
    });

    it("shouldn't register a student for a course that has no free seats available", async () => {
        const courseWithoutSeats = {
            ...courseData,
            availableSeats: 0,
        };

        (db.sql as any)
            .mockResolvedValueOnce([studentData])
            .mockResolvedValueOnce([courseWithoutSeats]);

        const result = await service.registerForCourse("student-123", "course-1");
        expect(result.success).toBe(false);
        expect(result.message).toMatch("No available seats for course CS101");
        expect(result.registeredCourse).toBeUndefined();
    });

    it("shouldn't register a student if that would exceed his credit hours", async () => {
        const courseWithHighCreditHours = {
            ...courseData,
            creditHours: 40, // Exceeds max credit hours
        };

        (db.sql as any)
            .mockResolvedValueOnce([studentData])
            .mockResolvedValueOnce([courseWithHighCreditHours]);

        const result = await service.registerForCourse("student-123", "course-1");
        expect(result.success).toBe(false);
        expect(result.message).toMatch("Registering for this course would exceed the maximum of 30 credit hours");
        expect(result.registeredCourse).toBeUndefined();
    })




})