import { vi, it, expect, describe, beforeAll, afterAll } from "vitest";
import {
  Course,
  CourseRegistrationService,
  Student,
} from "./ClassRegistrationService";
import { db } from "../utils/db";

vi.mock("../utils/db.ts");

describe("ClassRegistrationService", () => {
  let registrationService: CourseRegistrationService;

  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 8, 1));

    vi.mocked(db.sql).mockImplementation(
      async (query: string, params?: unknown[]) => {
        const safeParams = params ?? [];
        if (query.match(/SELECT \* FROM students/i)) {
          const student: Student = {
            id: safeParams[0] as string,
            name: "Mikołaj Kubś",
            completedCourses: [],
            currentCourses: [],
            maxCreditHours: 10,
          };
          return [student];
        }
        if (query.match(/SELECT \* FROM courses/i)) {
          const course: Course = {
            id: safeParams[0] as string,
            code: "stupid",
            name: "Data Warehouse",
            creditHours: 5,
            availableSeats: 2,
            prerequisites: [],
            schedule: [],
          };
          return [course];
        }
        if (query.includes("INSERT")) {
          return [{ success: true }];
        }
        return [];
      }
    );

    registrationService = new CourseRegistrationService();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it("handles student registration for course", async () => {
    console.log(await registrationService.registerForCourse("1", "1"));
    expect(await registrationService.registerForCourse("1", "1")).toMatchObject(
      {
        success: true,
      }
    );
  });
});
