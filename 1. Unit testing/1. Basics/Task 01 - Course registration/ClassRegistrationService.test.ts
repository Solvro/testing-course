import { describe, test, it, expect, beforeEach } from "vitest";
import {
  Course,
  ClassSchedule,
  Student,
  RegistrationResult,
  CourseRegistrationService,
} from "./ClassRegistrationService";

//arrange act assert
// describe("name", () => {
//   it("description", () => {
//   });
// });

const classSchedules = [
  {
    day: "Monday",
    startTime: "13:15",
    endTime: "14:45",
    location: "D-2",
  },
  {
    day: "Monday",
    startTime: "13:15",
    endTime: "14:45",
    location: "D-2",
  },
  {
    day: "Tuesday",
    startTime: "13:15",
    endTime: "14:45",
    location: "D-2",
  },
] as const; //fixes ts error with not knowing if day matches the type

const courses = [
  {
    id: "1",
    code: "KURS-1",
    name: "Hurtownie danych",
    creditHours: 12,
    availableSeats: 1,
    prerequisites: [],
    schedule: [classSchedules[0]],
  },
  {
    id: "2",
    code: "KURS-2",
    name: "Architektura Komputerów",
    creditHours: 12,
    availableSeats: 1,
    prerequisites: ["1"],
    schedule: [classSchedules[1]],
  },
  {
    id: "3",
    code: "KURS-3",
    name: "Sztuczna Inteligencja",
    creditHours: 12,
    availableSeats: 1,
    prerequisites: [],
    schedule: [classSchedules[2]],
  },
  {
    id: "4",
    code: "KURS-4",
    name: "Analiza II",
    creditHours: 40,
    availableSeats: 1,
    prerequisites: [],
    schedule: [classSchedules[2]],
  },
];

const students = [
  {
    id: "272669",
    name: "Natalia M",
    completedCourses: [],
    currentCourses: [],
    maxCreditHours: 12,
  },
  {
    id: "272690",
    name: "Jakub C",
    completedCourses: ["1"],
    currentCourses: [],
    maxCreditHours: 30,
  },
];

const courseRegistrationService = new CourseRegistrationService(
  courses,
  students
);

describe("registerForCourse", () => {
  let service: CourseRegistrationService; //let because we create a new instance before every test
  beforeEach(() => {
    service = new CourseRegistrationService(
      JSON.parse(JSON.stringify(courses)),
      JSON.parse(JSON.stringify(students))
    ); //deep copy solution from stack
  });

  it("should return false for a non-existant student", () => {
    const testStudentId = "kkk";
    const result = service.registerForCourse(testStudentId, "1");
    expect(result.success).toBe(false);
    expect(result.message).toBe(`Student with ID ${testStudentId} not found`);
  });

  it("should return false for a non-existant course", () => {
    const testCourseId = "kkk";
    const result = service.registerForCourse("272669", testCourseId);
    expect(result.success).toBe(false);
    expect(result.message).toBe(`Course with ID ${testCourseId} not found`);
  });

  it("should return false for an already registered student", () => {
    service.registerForCourse("272669", "1");
    const result = service.registerForCourse("272669", "1");
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/Student is already registered for/i);
  });

  it("should return false for unmet prerequisites", () => {
    const result = service.registerForCourse("272669", "2");
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/Missing prerequisites/i);
  });

  it("should return false for conflicting schedules", () => {
    service.registerForCourse("272690", "2");
    const result = service.registerForCourse("272690", "1");
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/Schedule conflict detected with course/i);
  });

  it("should return false for exceeding credit hour limits", () => {
    const result = service.registerForCourse("272669", "4");
    expect(result.success).toBe(false);
    expect(result.message).toMatch(
      /Registering for this course would exceed the maximum/i
    );
  });

  it("should return true for all checks passed", () => {
    const result = service.registerForCourse("272690", "2");
    expect(result.success).toBe(true);
    expect(result.message).toMatch(/Successfully registered for/i);
  });
});
