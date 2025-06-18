import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { CourseRegistrationService, Course, Student } from "./ClassRegistrationService";
import { db } from "../utils/db";

describe("CourseRegistrationService", () => {
  vi.mock("../utils/db", () => ({
    db: {
      sql: vi.fn()
    }
  }));

  const course: Course = {
    id: "1",
    code: "CS",
    name: "Computer Science",
    creditHours: 4,
    availableSeats: 2,
    prerequisites: [],
    schedule: [
      { day: "Monday", startTime: "9:15", endTime: "11:00", location: "C3" }
    ]
  };

  const student: Student = {
    id: "1",
    name: "Jacob",
    completedCourses: [],
    currentCourses: [],
    maxCreditHours: 6
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 1, 1));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("should throw an error if month doesn't match", () => {
    vi.setSystemTime(new Date(2024, 5, 1));
    expect(() => new CourseRegistrationService()).toThrowError(
      "Registration is only available in February and September"
    );
  });

  it("should not throw an error in February or September", () => {
    expect(() => new CourseRegistrationService()).not.toThrowError();
    vi.setSystemTime(new Date(2024, 8, 1));
    expect(() => new CourseRegistrationService()).not.toThrowError();
  });

  it("should return course by id", async () => {
    const service = new CourseRegistrationService();
    vi.spyOn(db, "sql").mockResolvedValueOnce([course]);

    const res = await service.getCourse("1");
    expect(db.sql).toHaveBeenCalledWith("SELECT * FROM courses WHERE id = $1", ["1"]);
    expect(res).not.toBeNull();
  });

  it("should return student by id", async () => {
    const service = new CourseRegistrationService();
    vi.spyOn(db, "sql").mockResolvedValueOnce([student]);

    const res = await service.getStudent("1");
    expect(db.sql).toHaveBeenCalledWith("SELECT * FROM students WHERE id = $1", ["1"]);
    expect(res).not.toBeNull();
  });

  it("should register a student for a course", async () => {
    const service = new CourseRegistrationService();
    vi.spyOn(db, "sql")
      .mockResolvedValueOnce([student])
      .mockResolvedValueOnce([course])
      
    const res = await service.registerForCourse("1", "1");
    expect(db.sql).toHaveBeenCalledWith("SELECT * FROM students WHERE id = $1", ["1"]);
    expect(db.sql).toHaveBeenCalledWith("SELECT * FROM courses WHERE id = $1", ["1"]);
    expect(res.success).toBeTruthy();
    expect(res.message).toMatch(/Successfully registered/);
  });

  it("should not register a non existing student", async () => {
    const service = new CourseRegistrationService();
    vi.spyOn(db, "sql")
      .mockResolvedValueOnce([course])
      .mockResolvedValueOnce([]);
      
    const res = await service.registerForCourse("1", "1");
    expect(db.sql).toHaveBeenCalledWith("SELECT * FROM courses WHERE id = $1", ["1"]);
    expect(res.success).toBeFalsy();
    expect(res.message).toMatch(/not found/);
  });

  it("should not register a student for a non existing course", async () => {
    const service = new CourseRegistrationService();
    vi.spyOn(db, "sql")
      .mockResolvedValueOnce([student])
      .mockResolvedValueOnce([]);
      
    const res = await service.registerForCourse("1", "1");
    expect(db.sql).toHaveBeenCalledWith("SELECT * FROM students WHERE id = $1", ["1"]);
    expect(res.success).toBeFalsy();
    expect(res.message).toMatch(/not found/);
  });

  it("should not register a student to a course he is already registered for", async () => {
    const registeredStudent = { ...student, currentCourses: ["1"] };

    const service = new CourseRegistrationService();
    vi.spyOn(db, "sql")
      .mockResolvedValueOnce([registeredStudent])
      .mockResolvedValueOnce([course]);

    const res = await service.registerForCourse("1", "1");
    expect(db.sql).toHaveBeenCalledWith("SELECT * FROM students WHERE id = $1", ["1"]);
    expect(db.sql).toHaveBeenCalledWith("SELECT * FROM courses WHERE id = $1", ["1"]);
    expect(res.success).toBeFalsy();
    expect(res.message).toMatch(/Student is already registered/);
  });

  it("should not register a student to a course that miss prerequisites", async () => {
    const courseWithPrerequisites: Course = {
      ...course,
      prerequisites: ["2"]
    };
    const registeredStudent: Student = {
      ...student,
      completedCourses: ["1"]
    };

    const service = new CourseRegistrationService();
    vi.spyOn(db, "sql")
      .mockResolvedValueOnce([registeredStudent])
      .mockResolvedValueOnce([courseWithPrerequisites])
      .mockResolvedValueOnce([]);

    const res = await service.registerForCourse("1", "2");
    expect(db.sql).toHaveBeenCalledWith("SELECT * FROM students WHERE id = $1", ["1"]);
    expect(db.sql).toHaveBeenCalledWith("SELECT * FROM courses WHERE id = $1", ["2"]);
    expect(res.success).toBeFalsy();
    expect(res.message).toMatch(/Missing prerequisites/);
  });

  it("should not register a student with schedule conflict", async () => {
    const conflictingCourse: Course = {
      ...course,
      id: "2",
      schedule: [
        { day: "Monday", startTime: "10:00", endTime: "12:00", location: "C4" }
      ]
    };

    const registeredStudent: Student = {
      ...student,
      currentCourses: ["1"]
    };

    const service = new CourseRegistrationService();
    vi.spyOn(db, "sql")
      .mockResolvedValueOnce([registeredStudent])
      .mockResolvedValueOnce([conflictingCourse])
      .mockResolvedValueOnce([course]);

    const res = await service.registerForCourse("1", "2");
    expect(db.sql).toHaveBeenCalledWith("SELECT * FROM students WHERE id = $1", ["1"]);
    expect(db.sql).toHaveBeenCalledWith("SELECT * FROM courses WHERE id = $1", ["2"]);
    expect(res.success).toBeFalsy();
    expect(res.message).toMatch(/Schedule conflict/);
  });

  it("should not register a student for a course with no available seats", async () => {
    const fullCourse: Course = {
      ...course,
      availableSeats: 0
    };

    const newStudent: Student = {
      ...student,
      currentCourses: []
    };

    const service = new CourseRegistrationService();
    vi.spyOn(db, "sql")
      .mockResolvedValueOnce([newStudent])
      .mockResolvedValueOnce([fullCourse])

    const res = await service.registerForCourse("1", "1");
    expect(db.sql).toHaveBeenCalledWith("SELECT * FROM students WHERE id = $1", ["1"]);
    expect(db.sql).toHaveBeenCalledWith("SELECT * FROM courses WHERE id = $1", ["1"]);
    expect(res.success).toBeFalsy();
    expect(res.message).toMatch(/No available seats/);
  });

  it("should not register a student exceeding max credit hours", async () => {
    const newCourse: Course = {
      ...course,
      creditHours: 5
    };

    const newStudent: Student = {
      ...student,
      currentCourses: [],
      maxCreditHours: 4
    };

    const service = new CourseRegistrationService();
    vi.spyOn(db, "sql")
      .mockResolvedValueOnce([newStudent])
      .mockResolvedValueOnce([newCourse]);

    const res = await service.registerForCourse("1", "1");
    expect(db.sql).toHaveBeenCalledWith("SELECT * FROM students WHERE id = $1", ["1"]);
    expect(db.sql).toHaveBeenCalledWith("SELECT * FROM courses WHERE id = $1", ["1"]);
    expect(res.success).toBeFalsy();
    expect(res.message).toMatch(/would exceed the maximum/);
  });
});