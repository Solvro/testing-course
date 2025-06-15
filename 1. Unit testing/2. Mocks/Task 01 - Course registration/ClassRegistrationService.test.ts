import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  CourseRegistrationService,
  type Course,
  type Student,
} from "./ClassRegistrationService";
import { db } from "../utils/db";

vi.mock("../utils/db");

const createStudent = (overrides?: Partial<Student>): Student => {
  return {
    id: "123",
    completedCourses: ["abc", "def"],
    currentCourses: ["456"],
    maxCreditHours: 3,
    name: "John Doe",
    ...overrides,
  } satisfies Student;
};

const createCourse = (overrides?: Partial<Course>): Course => {
  return {
    id: "456",
    code: "EE2",
    name: "IT Basics",
    creditHours: 3,
    availableSeats: 10,
    prerequisites: ["789"],
    schedule: [
      {
        day: "Monday",
        startTime: "08:00",
        endTime: "08:45",
        location: "C-13",
      },
    ],
    ...overrides,
  } satisfies Course;
};

describe("constructor", () => {
  it.each([
    {
      date: "2025-01-31 23:59",
      scenario: "the day before february",
    },
    {
      date: "2025-03-01 00:00",
      scenario: "the day after february",
    },
    {
      date: "2025-08-31 23:59",
      scenario: "the day before september",
    },
    {
      date: "2025-10-01 00:00",
      scenario: "the day after february",
    },
  ])("should throw when attempting to register $scenario", ({ date }) => {
    vi.setSystemTime(date);

    expect(() => new CourseRegistrationService()).toThrow(
      /february and september/i
    );
  });

  it.each([
    {
      date: "2025-02-01 00:00",
      scenario: "at the beginning of february",
    },
    {
      date: "2025-02-28 23:59",
      scenario: "at the end of february",
    },
    {
      date: "2025-09-01 00:00",
      scenario: "at the beginning of september",
    },
    {
      date: "2025-09-30 23:59",
      scenario: "at the end of september",
    },
  ])("should not throw when attempting to register $scenario", ({ date }) => {
    vi.setSystemTime(date);
    const instance = new CourseRegistrationService();
    expect(instance).toBeInstanceOf(CourseRegistrationService);
  });
});

// "getStudent" would be implemented the same way
describe("getCourse", () => {
  let registerationService: CourseRegistrationService;
  beforeEach(() => {
    vi.setSystemTime("2025-02-12 12:00");
    registerationService = new CourseRegistrationService();
  });

  it("should return undefined if no course with given id was found", async () => {
    vi.mocked(db.sql).mockResolvedValue([]);

    const result = await registerationService.getCourse("123");

    expect(result).toBeUndefined();
  });

  it("should return first course found with given id", async () => {
    const courseA = createCourse({ name: "Algebra" });
    const courseB = createCourse({ name: "Calculus" });
    vi.mocked(db.sql).mockResolvedValue([courseA, courseB]);

    const result = await registerationService.getCourse("123");

    expect(result).toBe(courseA);
  });
});

describe("getEligibleCourses", () => {
  let registerationService: CourseRegistrationService;
  beforeEach(() => {
    vi.setSystemTime("2025-02-12 12:00");
    registerationService = new CourseRegistrationService();
  });

  it("should return no courses when a student wasn't found by their id", async () => {
    registerationService.getStudent = vi.fn(() => Promise.resolve(undefined));

    const courses = await registerationService.getEligibleCourses("123");

    expect(courses).toEqual([]);
  });

  it("should skip courses the student is already enrolled in", async () => {
    const student = createStudent();
    const course = createCourse();

    registerationService.getStudent = vi.fn(() => Promise.resolve(student));
    // Mocking 'const allCoursesRows = await db.sql("SELECT * FROM courses");'
    vi.mocked(db.sql).mockResolvedValue([course]);

    const result = await registerationService.getEligibleCourses(student.id);
    expect(result).toEqual([]);
  });

  it("should skip the course if the student misses at least one of its prerequisites", async () => {
    const student = createStudent({
      currentCourses: [],
      completedCourses: [],
    });
    const course = createCourse();
    registerationService.getStudent = vi.fn(() => Promise.resolve(student));
    vi.mocked(db.sql).mockResolvedValue([course]);

    const result = await registerationService.getEligibleCourses(student.id);
    expect(result).toEqual([]);
  });

  it("should skip the course if no seats are available", async () => {
    const student = createStudent({
      currentCourses: [],
      completedCourses: ["789"],
    });
    const course = createCourse({ availableSeats: 0 });

    registerationService.getStudent = vi.fn(() => Promise.resolve(student));
    vi.mocked(db.sql).mockResolvedValue([course]);

    const result = await registerationService.getEligibleCourses(student.id);
    expect(result).toEqual([]);
  });

  it("should skip the course if sum of a student's current credits and the courses' credit hours exceeds student's max credit hours", async () => {
    const student = createStudent({
      currentCourses: [],
      completedCourses: ["789"],
      maxCreditHours: 10,
    });
    const course = createCourse({
      creditHours: 20,
    });

    registerationService.getStudent = vi.fn(() => Promise.resolve(student));
    vi.mocked(db.sql).mockResolvedValue([course]);

    const result = await registerationService.getEligibleCourses(student.id);
    expect(result).toEqual([]);
  });

  it("should return the course if the student is eligible", async () => {
    const student = createStudent({
      currentCourses: [],
      completedCourses: ["789"],
      maxCreditHours: 10,
    });
    const course = createCourse();

    registerationService.getStudent = vi.fn(() => Promise.resolve(student));
    vi.mocked(db.sql).mockResolvedValue([course]);

    const result = await registerationService.getEligibleCourses(student.id);
    expect(result).toEqual([course]);
  });
});
