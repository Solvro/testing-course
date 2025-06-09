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
  let service: CourseRegistrationService;

  beforeEach(() => {
    service = new CourseRegistrationService();
  });

  it("successfully registers a student for a course", async () => {
    const mockStudent = {
      id: "s1",
      name: "Alice",
      completedCourses: [],
      currentCourses: [],
      maxCreditHours: 6,
    };

    const mockCourse = {
      id: "c1",
      code: "CS101",
      name: "Intro to CS",
      creditHours: 3,
      availableSeats: 1,
      prerequisites: [],
      schedule: [
        {
          day: "Monday",
          startTime: "09:00",
          endTime: "10:30",
          location: "Room A",
        },
      ],
    };

    (db.sql as Mock).mockImplementation((query: string) => {
      if (query.includes("FROM students")) {
        return Promise.resolve([mockStudent]);
      }

      if (query.includes("FROM courses")) {
        return Promise.resolve([mockCourse]);
      }

      return Promise.resolve([]);
    });

    const result = await service.registerForCourse("s1", "c1");

    expect(result.success).toBe(true);
    expect(result.message).toBe("Successfully registered for CS101");
    expect(result.registeredCourse?.code).toBe("CS101");
  });

  it("fails if student does not exist", async () => {
    (db.sql as Mock).mockImplementation((query: string) => {
      if (query.includes("FROM students")) {
        return Promise.resolve([]);
      }

      return Promise.resolve([]);
    });

    const result = await service.registerForCourse("missing", "c1");

    expect(result.success).toBe(false);
    expect(result.message).toBe("Student with ID missing not found");
  });

  it("fails if course does not exist", async () => {
    const mockStudent = {
      id: "s1",
      name: "Alice",
      completedCourses: [],
      currentCourses: [],
      maxCreditHours: 6,
    };

    (db.sql as Mock).mockImplementation((query: string) => {
      if (query.includes("FROM students")) {
        return Promise.resolve([mockStudent]);
      }

      if (query.includes("FROM courses")) {
        return Promise.resolve([]);
      }

      return Promise.resolve([]);
    });

    const result = await service.registerForCourse("s1", "missing-course");

    expect(result.success).toBe(false);
    expect(result.message).toBe("Course with ID missing-course not found");
  });

  it("fails if prerequisites are missing", async () => {
    const mockStudent = {
      id: "s1",
      name: "Alice",
      completedCourses: [],
      currentCourses: [],
      maxCreditHours: 6,
    };

    const mockCourse = {
      id: "c1",
      code: "CS201",
      name: "Data Structures",
      creditHours: 3,
      availableSeats: 1,
      prerequisites: ["c0"],
      schedule: [],
    };

    const mockPrereqCourse = {
      id: "c0",
      code: "CS101",
      name: "Intro to CS",
      creditHours: 3,
      availableSeats: 5,
      prerequisites: [],
      schedule: [],
    };

    (db.sql as Mock).mockImplementation((query: string, args: any[]) => {
      if (query.includes("FROM students")) {
        return Promise.resolve([mockStudent]);
      }

      if (query.includes("FROM courses WHERE id = $1")) {
        if (args[0] === "c1") {
          return Promise.resolve([mockCourse]);
        }

        if (args[0] === "c0") {
          return Promise.resolve([mockPrereqCourse]);
        }
      }

      return Promise.resolve([]);
    });

    const result = await service.registerForCourse("s1", "c1");

    expect(result.success).toBe(false);
    expect(result.message).toContain("Missing prerequisites: CS101");
  });
});
