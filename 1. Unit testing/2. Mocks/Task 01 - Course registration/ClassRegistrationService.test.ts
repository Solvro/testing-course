import {
  vi,
  it,
  expect,
  describe,
  beforeAll,
  afterAll,
  afterEach,
  beforeEach,
} from "vitest";
import {
  Course,
  CourseRegistrationService,
  Student,
} from "./ClassRegistrationService";
import { db } from "../utils/db";

function simpleStudent(overrides: Partial<Student> = {}): Student {
  return {
    id: "1",
    name: "Mikołaj Kubś",
    completedCourses: [],
    currentCourses: [],
    maxCreditHours: 1,
    ...overrides,
  };
}

function simpleCourse(overrides: Partial<Course> = {}): Course {
  return {
    id: "1",
    code: "dw",
    name: "Data Warehouse",
    creditHours: 1,
    availableSeats: 1,
    prerequisites: [],
    schedule: [],
    ...overrides,
  };
}

vi.mock("../utils/db.ts");

describe("ClassRegistrationService", () => {
  let registrationService: CourseRegistrationService;

  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 8, 1));

    registrationService = new CourseRegistrationService();
  });

  afterAll(() => {
    vi.useRealTimers();
    vi.resetAllMocks();
  });

  it("throws error when using unsupported system time", () => {
    vi.setSystemTime(new Date(2025, 5, 1));

    expect(() => new CourseRegistrationService()).toThrowError(
      /only available/i
    );
  });

  it("handles student registration for course", async () => {
    vi.mocked(db.sql).mockImplementation(
      async (query: string, params?: unknown[]) => {
        const safeParams = params ?? [];
        if (query.match(/SELECT \* FROM students/i)) {
          return [simpleStudent({ id: safeParams[0] as string })];
        }
        if (query.match(/SELECT \* FROM courses/i)) {
          return [simpleCourse({ id: safeParams[0] as string })];
        }
        if (query.includes("INSERT")) {
          return [{ success: true }];
        }
        return [];
      }
    );

    expect(await registrationService.registerForCourse("1", "1")).toMatchObject(
      {
        success: true,
      }
    );
  });

  it("is unsuccessful when already registered", async () => {
    vi.mocked(db.sql).mockImplementation(
      async (query: string, params?: unknown[]) => {
        const safeParams = params ?? [];
        if (query.match(/SELECT \* FROM students/i)) {
          return [
            simpleStudent({
              id: safeParams[0] as string,
              currentCourses: ["1"],
            }),
          ];
        }
        if (query.match(/SELECT \* FROM courses/i)) {
          return [simpleCourse({ id: safeParams[0] as string })];
        }
        if (query.includes("INSERT")) {
          return [{ success: true }];
        }
        return [];
      }
    );

    const result = await registrationService.registerForCourse("1", "1");
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/already registered/i);
  });

  it("is unsuccessful when student is missing prerequisites", async () => {
    vi.mocked(db.sql).mockImplementation(
      async (query: string, params?: unknown[]) => {
        const safeParams = params ?? [];
        if (query.match(/SELECT \* FROM students/i)) {
          return [
            simpleStudent({
              id: safeParams[0] as string,
            }),
          ];
        }
        if (query.match(/SELECT \* FROM courses/i)) {
          return [
            simpleCourse({ id: safeParams[0] as string, prerequisites: ["1"] }),
          ];
        }
        if (query.includes("INSERT")) {
          return [{ success: true }];
        }
        return [];
      }
    );

    const result = await registrationService.registerForCourse("1", "1");
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/missing prerequisites/i);
  });

  it("is unsuccessful when student is missing prerequisites", async () => {
    vi.mocked(db.sql).mockImplementation(
      async (query: string, params?: unknown[]) => {
        const safeParams = params ?? [];
        if (query.match(/SELECT \* FROM students/i)) {
          return [
            simpleStudent({
              id: safeParams[0] as string,
            }),
          ];
        }
        if (query.match(/SELECT \* FROM courses/i)) {
          return [
            simpleCourse({ id: safeParams[0] as string, prerequisites: ["1"] }),
          ];
        }
        if (query.includes("INSERT")) {
          return [{ success: true }];
        }
        return [];
      }
    );

    const result = await registrationService.registerForCourse("1", "1");
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/missing prerequisites/i);
  });

  it("is unsuccessful when student has schedule conflict", async () => {
    vi.mocked(db.sql).mockImplementation(
      async (query: string, params?: unknown[]) => {
        const safeParams = params ?? [];
        if (query.match(/SELECT \* FROM students/i)) {
          return [
            simpleStudent({
              id: safeParams[0] as string,
              currentCourses: ["2"],
            }),
          ];
        }
        if (query.match(/SELECT \* FROM courses/i)) {
          return [
            simpleCourse({
              id: safeParams[0] as string,
              schedule: [
                {
                  day: "Monday",
                  startTime: "12:00",
                  endTime: "13:00",
                  location: "D1",
                },
              ],
            }),
          ];
        }
        if (query.includes("INSERT")) {
          return [{ success: true }];
        }
        return [];
      }
    );

    const result = await registrationService.registerForCourse("1", "1");
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/schedule conflict/i);
  });
});
