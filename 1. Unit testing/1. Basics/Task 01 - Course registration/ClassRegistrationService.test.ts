import { it, expect, describe, beforeEach } from "vitest";
import type { Course, Student } from "./ClassRegistrationService";
import { CourseRegistrationService } from "./ClassRegistrationService";

let service: CourseRegistrationService;
let sampleCourses: Course[];
let sampleStudents: Student[];
beforeEach(() => {
  sampleCourses = [
    {
      id: "cs101",
      code: "CS101",
      name: "Introduction to Computer Science",
      creditHours: 3,
      availableSeats: 30,
      prerequisites: [],
      schedule: [
        {
          day: "Monday",
          startTime: "10:00",
          endTime: "11:30",
          location: "Building B4, Room 101",
        },
      ],
    },
    {
      id: "gs102",
      code: "GS102",
      name: "Introduction to Gaming",
      creditHours: 2,
      availableSeats: 100,
      prerequisites: [],
      schedule: [
        {
          day: "Friday",
          startTime: "15:15",
          endTime: "16:45",
          location: "Building A1, Room 102",
        },
      ],
    },
    {
      id: "is101",
      code: "IS101",
      name: "Introduction to Introduction Science",
      creditHours: 1,
      availableSeats: 31,
      prerequisites: [],
      schedule: [
        {
          day: "Wednesday",
          startTime: "9:15",
          endTime: "10:45",
          location: "Building C5, Room 04",
        },
      ],
    },
  ];

  sampleStudents = [
    {
      id: "student1",
      name: "Arkadiusz Czerepach",
      completedCourses: ["gs102"],
      currentCourses: ["is101"],
      maxCreditHours: 18,
    },
    {
      id: "student2",
      name: "Terry Davis",
      completedCourses: [],
      currentCourses: [],
      maxCreditHours: 18,
    },
    {
      id: "student3",
      name: "Jan Kowalski",
      completedCourses: ["cs101"],
      currentCourses: [],
      maxCreditHours: 20,
    },
  ];
  service = new CourseRegistrationService(sampleCourses, sampleStudents);
});

describe("registerForCourse", () => {
  it("should register a student for a class", () => {
    const result = service.registerForCourse("student1", "cs101");
    expect(result.success).toBe(true);
    expect(result.registeredCourse?.id).toBe("cs101");
    expect(result.message).toMatch(/register/i);
  });
  it("should not register a student for a class that doesnt exist", () => {
    const result = service.registerForCourse("student2", "Solvro");
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/not found/i);
  });
  it("should not register a student for a class if student doesnt exist", () => {
    const result = service.registerForCourse("Jackob", "cs101");
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/not found/i);
  });
  it("should not register a student for the class that he is  already signed for", () => {
    const result = service.registerForCourse("student1", "is101");
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/already/i);
  });
});

describe("dropCourse", () => {
  it("should drop a course for a student", () => {
    const result = service.dropCourse("student1", "is101");
    expect(result.success).toBe(true);
    expect(result.message).toMatch(/dropped/i);
  });
  it("student cant drop from a course that he didnt sign for", () => {
    const result = service.dropCourse("student1", "gs102");
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/not/i);
  });
  it("student cant drop from ifhe doesnt exist", () => {
    const result = service.dropCourse("Damian", "cs101");
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/not/i);
  });
});

describe(" getEligibleCourses", () => {
  it("should return 2 courses for student", () => {
    const result = service.getEligibleCourses("student1");
    expect(result.length).toBe(2);
    expect(result.map((course) => course.id)).toContain("cs101");
  });
});
