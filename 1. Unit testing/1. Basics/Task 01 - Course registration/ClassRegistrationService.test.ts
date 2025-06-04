import { describe, expect, it } from "vitest";
import {
  ClassSchedule,
  Course,
  CourseRegistrationService,
  Student,
} from "./ClassRegistrationService";

const mockStudent: Student = {
  id: "siema",
  completedCourses: ["alglin"],
  currentCourses: ["fizyka"],
  maxCreditHours: 1,
  name: "jakis typ",
};

const mockStudent2: Student = {
  id: "eniu",
  completedCourses: [],
  currentCourses: [],
  maxCreditHours: 2,
  name: "jakis typ drugi",
};

const mockGoodStudent: Student = {
  id: "nara",
  completedCourses: ["alglin"],
  currentCourses: [],
  maxCreditHours: 5,
  name: "jakis nerd",
};

const mockClassSchedule: ClassSchedule = {
  day: "Tuesday",
  location: "c16",
  startTime: "15:15",
  endTime: "16:45",
};

const mockCourse: Course = {
  id: "alglin",
  name: "algebra liniowa",
  code: "alglin",
  creditHours: 5,
  availableSeats: 1,
  prerequisites: [],
  schedule: [mockClassSchedule],
};

const mockClassSchedule2: ClassSchedule = {
  day: "Tuesday",
  location: "c5",
  startTime: "15:15",
  endTime: "16:45",
};

const mockCourse2: Course = {
  id: "picpiw",
  name: "picie piwa",
  code: "picpiw",
  creditHours: 1,
  availableSeats: 20,
  prerequisites: ["alglin"],
  schedule: [mockClassSchedule2],
};

const mockCourse3: Course = {
  id: "fizyka",
  name: "fizyka",
  code: "fizyka",
  creditHours: 4,
  availableSeats: 20,
  prerequisites: ["alglin"],
  schedule: [mockClassSchedule2],
};

describe("registerForCourse", () => {
  it("no student", () => {
    const service: CourseRegistrationService = new CourseRegistrationService(
      [],
      []
    );

    const result = service.registerForCourse("takiego goscia nie ma", "");

    expect(result.success).toBe(false);
  });

  it("no course", () => {
    const service: CourseRegistrationService = new CourseRegistrationService(
      [],
      [mockStudent]
    );

    const result = service.registerForCourse("siema", "");

    expect(result.success).toBe(false);
  });

  it("is in the course", () => {
    const student = mockStudent;

    student.currentCourses = ["alglin"];

    const service: CourseRegistrationService = new CourseRegistrationService(
      [mockCourse],
      [mockStudent]
    );

    const result = service.registerForCourse("siema", "alglin");

    expect(result.success).toBe(false);
  });

  it("missing prerequisites", () => {
    const service: CourseRegistrationService = new CourseRegistrationService(
      [mockCourse2, mockCourse],
      [mockStudent]
    );

    const result = service.registerForCourse("siema", "picpiw");

    expect(result.success).toBe(false);
  });

  it("schedule conflict", () => {
    const service: CourseRegistrationService = new CourseRegistrationService(
      [mockCourse, mockCourse2],
      [mockStudent]
    );

    const result = service.registerForCourse("siema", "picpiw");

    expect(result.success).toBe(false);
  });

  it("no available seats", () => {
    const service: CourseRegistrationService = new CourseRegistrationService(
      [mockCourse],
      [mockStudent, mockStudent2]
    );

    service.registerForCourse("eniu", "alglin");
    const result = service.registerForCourse("siema", "alglin");

    expect(result.success).toBe(false);
  });

  it("exceeded credit hours", () => {
    const service: CourseRegistrationService = new CourseRegistrationService(
      [mockCourse],
      [mockStudent]
    );

    const result = service.registerForCourse("siema", "alglin");

    expect(result.success).toBe(false);
  });

  it("everything should work", () => {
    const service: CourseRegistrationService = new CourseRegistrationService(
      [mockCourse3, mockCourse],
      [mockGoodStudent]
    );

    const result = service.registerForCourse("nara", "fizyka");

    expect(result.success).toBe(true);
  });
});
