import { describe, it, expect, vi, beforeEach } from "vitest";
import { CourseRegistrationService } from "./ClassRegistrationService";
import { db } from "../utils/db";
import type { Course, Student } from "./ClassRegistrationService";

vi.mock("../utils/db");

describe("CourseRegistrationService", () => {
  const MOCK_COURSE: Course = {
    id: "1",
    code: "bazury123",
    name: "pieklo na ziemi",
    creditHours: 420,
    availableSeats: 69,
    prerequisites: [],
    schedule: [
      {
        day: "Monday",
        startTime: "09:15",
        endTime: "11:00",
        location: "D1",
      },
    ],
  };

  const MOCK_STUDENT: Student = {
    id: "1",
    name: "Bartłomiej Gotowicki",
    completedCourses: [],
    currentCourses: [],
    maxCreditHours: 120,
  };

  let service: CourseRegistrationService;

  beforeEach(() => {
    vi.setSystemTime(new Date("2025-02-01"));
    vi.clearAllMocks();
    service = new CourseRegistrationService();
  });

  describe("getCourse", () => {
    it("should return a course if one with specified id exists in database", async () => {
      vi.mocked(db.sql).mockResolvedValue([MOCK_COURSE]);

      const course = await service.getCourse("1");
      expect(course).toMatchObject(MOCK_COURSE);
    });

    it("should return undefined if there is no course with specified id", async () => {
      vi.mocked(db.sql).mockResolvedValue([]);

      const course = await service.getCourse("kebabito_bombardito");
      expect(course).toBeUndefined();
    });
  });

  describe("getStudent", () => {
    it("should return a student if one with specified id exists in database", async () => {
      vi.mocked(db.sql).mockResolvedValue([MOCK_STUDENT]);

      const student = await service.getStudent("1");
      expect(student).toMatchObject(MOCK_STUDENT);
    });

    it("should return undefined if there is no student with specified id", async () => {
      vi.mocked(db.sql).mockResolvedValue([]);

      const student = await service.getStudent("Linkid Linek");
      expect(student).toBeUndefined();
    });
  });
});
