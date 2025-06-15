import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { CourseRegistrationService, Student } from "./ClassRegistrationService";
import { db } from "../utils/db";

class TestableCourseRegistrationService extends CourseRegistrationService {
  public async _calculateCurrentCreditHours(student: Student) {
    // @ts-ignore
    return this.calculateCurrentCreditHours(student);
  }
}

describe("CourseRegistrationService.calculateCurrentCreditHours", () => {
  let service: TestableCourseRegistrationService;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 1, 1));
    service = new TestableCourseRegistrationService();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 0 if student has no current courses", async () => {
    const student: Student = {
      id: "s1",
      name: "Test",
      completedCourses: [],
      currentCourses: [],
      maxCreditHours: 20,
    };
    const result = await service._calculateCurrentCreditHours(student);
    expect(result).toBe(0);
  });

  it("returns credit hours for a single course", async () => {
    const student: Student = {
      id: "s2",
      name: "Test",
      completedCourses: [],
      currentCourses: ["c1"],
      maxCreditHours: 20,
    };
    vi.spyOn(db, "sql").mockImplementation(async (query, params) => {
      if (params && params[0] === "c1") {
        return [{ id: "c1", creditHours: 3 }];
      }
      return [];
    });
    const result = await service._calculateCurrentCreditHours(student);
    expect(result).toBe(3);
  });

  it("sums credit hours for multiple courses", async () => {
    const student: Student = {
      id: "s3",
      name: "Test",
      completedCourses: [],
      currentCourses: ["c1", "c2"],
      maxCreditHours: 20,
    };
    vi.spyOn(db, "sql").mockImplementation(async (query, params) => {
      if (params && params[0] === "c1") {
        return [{ id: "c1", creditHours: 2 }];
      }
      if (params && params[0] === "c2") {
        return [{ id: "c2", creditHours: 4 }];
      }
      return [];
    });
    const result = await service._calculateCurrentCreditHours(student);
    expect(result).toBe(6);
  });

  it("ignores courses that do not exist (returns 0 for them)", async () => {
    const student: Student = {
      id: "s4",
      name: "Test",
      completedCourses: [],
      currentCourses: ["c1", "cX"],
      maxCreditHours: 20,
    };
    vi.spyOn(db, "sql").mockImplementation(async (query, params) => {
      if (params && params[0] === "c1") {
        return [{ id: "c1", creditHours: 5 }];
      }
      return [];
    });
    const result = await service._calculateCurrentCreditHours(student);
    expect(result).toBe(5);
  });
});