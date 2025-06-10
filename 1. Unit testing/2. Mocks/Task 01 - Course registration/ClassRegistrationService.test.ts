import {
  vi,
  it,
  expect,
  describe,
  beforeAll,
  afterAll,
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

  // Helper to set the mocked DB response based on query type
  function mockDbImplementation(studentOverrides = {}, courseOverrides = {}) {
    vi.mocked(db.sql).mockImplementation(
      async (query: string, params?: unknown[]) => {
        const safeParams = params ?? [];
        if (/SELECT \* FROM students/i.test(query)) {
          return [simpleStudent({ id: safeParams[0] as string, ...studentOverrides })];
        }
        if (/SELECT \* FROM courses/i.test(query)) {
          return [simpleCourse({ id: safeParams[0] as string, ...courseOverrides })];
        }
        if (query.includes("INSERT")) {
          return [{ success: true }];
        }
        return [];
      }
    );
  }

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
    expect(() => new CourseRegistrationService()).toThrowError(/only available/i);
  });

  it("handles student registration for course successfully", async () => {
    mockDbImplementation();
    const result = await registrationService.registerForCourse("1", "1");
    expect(result).toMatchObject({ success: true });
  });

  it("is unsuccessful when already registered", async () => {
    mockDbImplementation({ currentCourses: ["1"] });
    const result = await registrationService.registerForCourse("1", "1");
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/already registered/i);
  });

  it("is unsuccessful when student is missing prerequisites", async () => {
    mockDbImplementation({}, { prerequisites: ["1"] });
    const result = await registrationService.registerForCourse("1", "1");
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/missing prerequisites/i);
  });

  it("is unsuccessful when student has schedule conflict", async () => {
    mockDbImplementation(
      { currentCourses: ["2"] },
      {
        schedule: [
          {
            day: "Monday",
            startTime: "12:00",
            endTime: "13:00",
            location: "D1",
          },
        ],
      }
    );
    const result = await registrationService.registerForCourse("1", "1");
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/schedule conflict/i);
  });
});
