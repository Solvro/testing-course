import { describe, expect, it, beforeEach } from "vitest";
import {
  Course,
  CourseRegistrationService,
  Student,
} from "./ClassRegistrationService";
import { makeCourse, makeStudent } from "./testHelpers";

describe("registerForCourse", () => {
  let courseRegistrationService: CourseRegistrationService;

  beforeEach(() => {
    const courses: Course[] = [
      {
        id: "C1",
        code: "CS101",
        name: "Introduction to Computer Science",
        creditHours: 3,
        availableSeats: 10,
        prerequisites: [],
        schedule: [
          {
            day: "Tuesday",
            startTime: "11:00",
            endTime: "12:30",
            location: "Room 101",
          },
        ],
      },
      {
        id: "C2",
        code: "CS102",
        name: "Data Structures",
        creditHours: 4,
        availableSeats: 5,
        prerequisites: [],
        schedule: [
          {
            day: "Tuesday",
            startTime: "11:00",
            endTime: "12:30",
            location: "Room 102",
          },
        ],
      },
      {
        id: "C3",
        code: "CS201",
        name: "Algorithms",
        creditHours: 3,
        availableSeats: 0,
        prerequisites: ["C2"],
        schedule: [
          {
            day: "Monday",
            startTime: "11:00",
            endTime: "12:30",
            location: "Room 201",
          },
        ],
      },

      {
        id: "C4",
        code: "CS301",
        name: "Coures with 42069 credit hours",
        creditHours: 42069,
        availableSeats: 1,
        prerequisites: [],
        schedule: [
          {
            day: "Friday",
            startTime: "11:00",
            endTime: "12:30",
            location: "Room 201",
          },
        ],
      },
    ];
    const students: Student[] = [
      {
        id: "1",
        name: "Alice Johnson",
        completedCourses: ["C2"],
        currentCourses: [],
        maxCreditHours: 18,
      },
      {
        id: "2",
        name: "Bob Smith",
        completedCourses: [],
        currentCourses: ["C1"],
        maxCreditHours: 15,
      },
      {
        id: "3",
        name: "Charlie Brown",
        completedCourses: ["C1", "C2"],
        currentCourses: ["C3"],
        maxCreditHours: 12,
      },
    ];

    courseRegistrationService = new CourseRegistrationService(
      courses,
      students
    );
  });

  it.each([
    {
      scenario: "student not found",
      studentId: "420",
      courseId: "C2",
      success: false,
      regex: /not found/i,
    },
    {
      scenario: "course not found",
      studentId: "1",
      courseId: "C69",
      success: false,
      regex: /not found/i,
    },
    {
      scenario: "student already registered",
      studentId: "3",
      courseId: "C3",
      success: false,
      regex: /registered/i,
    },
    {
      scenario: "student not met prerequisites",
      studentId: "2",
      courseId: "C3",
      success: false,
      regex: /missing prerequisites/i,
    },
    {
      scenario: "schedule conflicts",
      studentId: "2",
      courseId: "C2",
      success: false,
      regex: /conflict/i,
    },
    {
      scenario: "course has no available seats",
      studentId: "1",
      courseId: "C3",
      success: false,
      regex: /available seats/i,
    },
    {
      scenario: "exceeding credit hours limit",
      studentId: "1",
      courseId: "C4",
      success: false,
      regex: /exceed/i,
    },
  ])(
    "should fail because $scenario",
    ({ studentId, courseId, success, regex }) => {
      const result = courseRegistrationService.registerForCourse(
        studentId,
        courseId
      );

      expect(result.success).toBe(success);
      expect(result.message).toMatch(regex);
    }
  );

  it("should register student successfully", () => {
    const studentId = "1";
    const courseId = "C1";
    const student = courseRegistrationService.getStudent(studentId)!;
    const course = courseRegistrationService.getCourse(courseId)!;
    const previousCourseAvailableSeats = course?.availableSeats!;

    const result = courseRegistrationService.registerForCourse(
      studentId,
      courseId
    );

    expect(result.success).toBe(true);
    expect(result.message).toMatch(/successfully/i);
    expect(result).toHaveProperty("registeredCourse");

    expect(student.currentCourses).contains(courseId);
    expect(course.availableSeats).toBeLessThan(previousCourseAvailableSeats);
  });
});

describe("getEligbleCourses", () => {
  it("returns empty array if student is not found", () => {
    const courseRegistrationService = new CourseRegistrationService([], []);
    const studentId = "420";

    const result = courseRegistrationService.getEligibleCourses(studentId);

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(0);
  });

  it("does not return course if student is already registered", () => {
    const student = makeStudent({ currentCourses: ["C1"] });
    const course = makeCourse({ id: "C1" });
    const courses: Course[] = [course];
    const students: Student[] = [student];
    const courseRegistrationService = new CourseRegistrationService(
      courses,
      students
    );

    const result = courseRegistrationService.getEligibleCourses(student.id);

    expect(result).toHaveLength(0);
  });

  it("does not return course if prerequisites are not met", () => {
    const student = makeStudent();
    const course = makeCourse({ prerequisites: ["C2"] });
    const courses: Course[] = [course];
    const students: Student[] = [student];
    const courseRegistrationService = new CourseRegistrationService(
      courses,
      students
    );

    const result = courseRegistrationService.getEligibleCourses(student.id);

    expect(result).toHaveLength(0);
  });

  it("does not return course if no seats are available", () => {
    const student = makeStudent();
    const course = makeCourse({ availableSeats: 0 });
    const courses: Course[] = [course];
    const students: Student[] = [student];
    const courseRegistrationService = new CourseRegistrationService(
      courses,
      students
    );

    const result = courseRegistrationService.getEligibleCourses(student.id);

    expect(result).toHaveLength(0);
  });

  it("does not return course if it exceeds credit hours limit", () => {
    const student = makeStudent();
    const course = makeCourse({ creditHours: 30 });
    const courses: Course[] = [course];
    const students: Student[] = [student];
    const courseRegistrationService = new CourseRegistrationService(
      courses,
      students
    );

    const result = courseRegistrationService.getEligibleCourses(student.id);

    expect(result).toHaveLength(0);
  });

  it("returns eligible courses when all conditions are met", () => {
    const student = makeStudent();
    const course = makeCourse();
    const courses: Course[] = [course];
    const students: Student[] = [student];
    const courseRegistrationService = new CourseRegistrationService(
      courses,
      students
    );

    const result = courseRegistrationService.getEligibleCourses(student.id);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(course.id);
  });
});
