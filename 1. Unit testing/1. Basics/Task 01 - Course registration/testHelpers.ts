import { Course, Student } from "./ClassRegistrationService";

export function makeStudent(overrides?: Partial<Student>): Student {
  return {
    id: "1",
    name: "Test student",
    completedCourses: [],
    currentCourses: [],
    maxCreditHours: 18,
    ...overrides,
  };
}

export function makeCourse(overrides?: Partial<Course>): Course {
  return {
    id: "1",
    code: "CS101",
    name: "Test course",
    creditHours: 3,
    availableSeats: 11,
    prerequisites: [],
    schedule: [
      {
        day: "Tuesday",
        startTime: "11:00",
        endTime: "12:30",
        location: "Room 101",
      },
    ],
    ...overrides,
  };
}
