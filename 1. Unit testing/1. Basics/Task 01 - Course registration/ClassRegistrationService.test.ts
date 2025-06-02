import { expect, test } from "vitest";
import {
  Course,
  CourseRegistrationService,
  Student,
  RegistrationResult,
} from "./ClassRegistrationService";

function simpleCourse(overrides: Partial<Course> = {}): Course {
  return {
    id: "10",
    code: "code-10",
    name: "1",
    creditHours: 1,
    availableSeats: 1,
    prerequisites: [],
    schedule: [],
    ...overrides,
  };
}

test("getCourse returns course when id matches", () => {
  let course: Course = simpleCourse();
  let courseRegistrationService = new CourseRegistrationService([course], []);

  expect(courseRegistrationService.getCourse("10")).toBe(course);
});

test("getCourse returns undefined when no courses", () => {
  let courseRegistrationService = new CourseRegistrationService([], []);

  expect(courseRegistrationService.getCourse("10")).toBe(undefined);
});

test("getCourse returns undefined when id does not match", () => {
  let course: Course = simpleCourse();
  let courseRegistrationService = new CourseRegistrationService([course], []);

  expect(courseRegistrationService.getCourse("2")).toBe(undefined);
});

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

test("getCourse returns course when id matches", () => {
  let student: Student = simpleStudent();
  let courseRegistrationService = new CourseRegistrationService([], [student]);

  expect(courseRegistrationService.getStudent("1")).toBe(student);
});

test("getCourse returns undefined when no courses", () => {
  let courseRegistrationService = new CourseRegistrationService([], []);

  expect(courseRegistrationService.getStudent("1")).toBe(undefined);
});

test("getCourse returns undefined when id does not match", () => {
  let student: Student = simpleStudent();
  let courseRegistrationService = new CourseRegistrationService([], [student]);

  expect(courseRegistrationService.getStudent("2")).toBe(undefined);
});

test("registerForCourse returns correct on simple scenario", () => {
  let course: Course = simpleCourse();
  let student: Student = simpleStudent();
  let courseRegistrationService = new CourseRegistrationService(
    [course],
    [student]
  );

  expect(courseRegistrationService.registerForCourse("1", "10")).toStrictEqual({
    success: true,
    message: `Successfully registered for ${course.code}`,
    registeredCourse: course,
  });

  expect(student.currentCourses).toStrictEqual([course.id]);
  expect(course.availableSeats).toStrictEqual(0);
});

test("registerForCourse returns student already registered", () => {
  let course: Course = simpleCourse();
  course.availableSeats = 10;
  let student: Student = simpleStudent();
  let courseRegistrationService = new CourseRegistrationService(
    [course],
    [student]
  );

  expect(courseRegistrationService.registerForCourse("1", "10")).toStrictEqual({
    success: true,
    message: `Successfully registered for ${course.code}`,
    registeredCourse: course,
  });

  expect(student.currentCourses).toStrictEqual([course.id]);

  expect(courseRegistrationService.registerForCourse("1", "10")).toStrictEqual({
    success: false,
    message: `Student is already registered for code-10`,
  });
});

test("registerForCourse error on no such student", () => {
  let course: Course = simpleCourse();
  let courseRegistrationService = new CourseRegistrationService([course], []);

  expect(courseRegistrationService.registerForCourse("1", "10")).toStrictEqual({
    success: false,
    message: `Student with ID 1 not found`,
  });
});

test("registerForCourse error on no such course", () => {
  let student: Student = simpleStudent();
  let courseRegistrationService = new CourseRegistrationService([], [student]);

  expect(courseRegistrationService.registerForCourse("1", "10")).toStrictEqual({
    success: false,
    message: `Course with ID 10 not found`,
  });
});

test("registerForCourse error not meeting prerequisites ", () => {
  let student: Student = simpleStudent();
  let course: Course = simpleCourse();
  course.prerequisites = ["20"];
  let courseRegistrationService = new CourseRegistrationService(
    [course],
    [student]
  );

  expect(courseRegistrationService.registerForCourse("1", "10")).toStrictEqual({
    success: false,
    message: `Missing prerequisites: 20`,
  });
});

test("registerForCourse error on circular prerequisite", () => {
  let student: Student = simpleStudent();
  let course: Course = simpleCourse();
  course.prerequisites = ["10"];
  let courseRegistrationService = new CourseRegistrationService(
    [course],
    [student]
  );

  expect(
    courseRegistrationService.getCourse("10")?.prerequisites
  ).toStrictEqual(["10"]);

  expect(courseRegistrationService.registerForCourse("1", "10")).toStrictEqual({
    success: false,
    message: `Missing prerequisites: code-10`,
  });
});

test("registerForCourse passes on simple prerequisite", () => {
  let student: Student = simpleStudent({ completedCourses: ["11"] });
  let course: Course = simpleCourse({ prerequisites: ["11"] });
  let course2: Course = simpleCourse({ id: "11" });

  let courseRegistrationService = new CourseRegistrationService(
    [course, course2],
    [student]
  );

  expect(
    courseRegistrationService.registerForCourse("1", "10").message
  ).toStrictEqual("Successfully registered for code-10");
});

test("registerForCourse fails on complex prerequisite", () => {
  let student: Student = simpleStudent({
    completedCourses: ["14", "13"],
  });
  let course: Course = simpleCourse({ prerequisites: ["11", "12", "13"] });
  let course2: Course = simpleCourse({
    id: "11",
    prerequisites: ["14", "13"],
    code: "code-11",
  });
  let course3: Course = simpleCourse({ id: "12", code: "code-12" });
  let course4: Course = simpleCourse({ id: "13", code: "code-13" });
  let course5: Course = simpleCourse({ id: "14", code: "code-14" });

  let courseRegistrationService = new CourseRegistrationService(
    [course, course2, course3, course4, course5],
    [student]
  );

  expect(
    courseRegistrationService.registerForCourse("1", "11").message
  ).toStrictEqual("Successfully registered for code-11");

  expect(
    courseRegistrationService.registerForCourse("1", "10").message
  ).toStrictEqual("Missing prerequisites: code-11, code-12");
});

test("registerForCourse passes on complex prerequisite", () => {
  let student: Student = simpleStudent({
    completedCourses: ["11", "12", "14", "13"],
    maxCreditHours: 10,
  });
  let course: Course = simpleCourse({ prerequisites: ["11", "12", "13"] });
  let course2: Course = simpleCourse({
    id: "11",
    prerequisites: ["14", "13"],
    code: "code-11",
  });
  let course3: Course = simpleCourse({ id: "12", code: "code-12" });
  let course4: Course = simpleCourse({ id: "13", code: "code-13" });
  let course5: Course = simpleCourse({ id: "14", code: "code-14" });

  let courseRegistrationService = new CourseRegistrationService(
    [course, course2, course3, course4, course5],
    [student]
  );

  expect(
    courseRegistrationService.registerForCourse("1", "11").message
  ).toStrictEqual("Successfully registered for code-11");

  expect(
    courseRegistrationService.registerForCourse("1", "10").message
  ).toStrictEqual("Successfully registered for code-10");
});

test("registerForCourse fails on duplicate schedule", () => {
  let student: Student = simpleStudent({
    maxCreditHours: 2,
  });
  let course: Course = simpleCourse({
    schedule: [
      {
        day: "Monday",
        startTime: "10:00",
        endTime: "11:00",
        location: "Room 101",
      },
    ],
  });
  let course2: Course = simpleCourse({
    schedule: [
      {
        day: "Monday",
        startTime: "10:00",
        endTime: "11:00",
        location: "Room 101",
      },
    ],
    id: "11",
    code: "code-11",
  });

  let courseRegistrationService = new CourseRegistrationService(
    [course, course2],
    [student]
  );

  expect(
    courseRegistrationService.registerForCourse("1", "11").message
  ).toStrictEqual("Successfully registered for code-11");

  expect(
    courseRegistrationService.registerForCourse("1", "10").message
  ).toStrictEqual("Schedule conflict detected with course code-10");
});

test("registerForCourse passes on complex schedule", () => {
  let student: Student = simpleStudent({
    maxCreditHours: 2,
  });
  let course: Course = simpleCourse({
    schedule: [
      {
        day: "Monday",
        startTime: "0:00",
        endTime: "23:59",
        location: "Room 101",
      },
      {
        day: "Tuesday",
        startTime: "0:00",
        endTime: "23:59",
        location: "Room 101",
      },
      {
        day: "Wednesday",
        startTime: "0:00",
        endTime: "23:59",
        location: "Room 101",
      },
      {
        day: "Thursday",
        startTime: "0:00",
        endTime: "12:00",
        location: "Room 101",
      },
      {
        day: "Thursday",
        startTime: "12:00",
        endTime: "23:59",
        location: "Room 101",
      },
      {
        day: "Friday",
        startTime: "0:00",
        endTime: "23:59",
        location: "Room 101",
      },
    ],
  });
  let course2: Course = simpleCourse({
    schedule: [
      {
        day: "Thursday",
        startTime: "12:00",
        endTime: "11:59",
        location: "Room 101",
      },
    ],
    id: "11",
    code: "code-11",
  });

  // this should probably fail... not only startTime < endTime, but also startTime == startTime of other course

  let courseRegistrationService = new CourseRegistrationService(
    [course, course2],
    [student]
  );

  expect(
    courseRegistrationService.registerForCourse("1", "11").message
  ).toStrictEqual("Successfully registered for code-11");

  expect(
    courseRegistrationService.registerForCourse("1", "10").message
  ).toStrictEqual("Successfully registered for code-10");
});

test("registerForCourse SHOULD fail (MAYBE) on same room", () => {
  // this of course depends on the definition of "location" in the schedule
  let student: Student = simpleStudent({
    maxCreditHours: 2,
  });
  let student2: Student = simpleStudent({
    maxCreditHours: 2,
    id: "2",
    name: "Student 2",
  });
  let course: Course = simpleCourse({
    schedule: [
      {
        day: "Monday",
        startTime: "10:00",
        endTime: "11:00",
        location: "Room 101",
      },
    ],
  });
  let course2: Course = simpleCourse({
    schedule: [
      {
        day: "Monday",
        startTime: "10:00",
        endTime: "11:00",
        location: "Room 101",
      },
    ],
    id: "11",
    code: "code-11",
  });

  // depending on how we interpret location this maybe should fail here detecting room overlap
  let courseRegistrationService = new CourseRegistrationService(
    [course, course2],
    [student, student2]
  );

  expect(
    courseRegistrationService.registerForCourse("1", "11").message
  ).toStrictEqual("Successfully registered for code-11");

  expect(
    courseRegistrationService.registerForCourse("2", "10").message
  ).toStrictEqual("Successfully registered for code-10");
});

test("registerForCourse fails if credit hour limit exceeded", () => {
  let course: Course = simpleCourse({ creditHours: 2 });
  let student: Student = simpleStudent({ maxCreditHours: 1 });
  let courseRegistrationService = new CourseRegistrationService(
    [course],
    [student]
  );

  expect(courseRegistrationService.registerForCourse("1", "10")).toStrictEqual({
    success: false,
    message:
      "Registering for this course would exceed the maximum of 1 credit hours",
  });
});

test("dropCourse removes course from student", () => {
  let course: Course = simpleCourse({ availableSeats: 0 });
  let student: Student = simpleStudent({ currentCourses: ["10"] });
  let courseRegistrationService = new CourseRegistrationService(
    [course],
    [student]
  );

  expect(courseRegistrationService.dropCourse("1", "10")).toStrictEqual({
    success: true,
    message: "Successfully dropped code-10",
  });

  expect(student.currentCourses).toStrictEqual([]);
  expect(course.availableSeats).toBe(1);
});

test("dropCourse fails if student not found", () => {
  let course: Course = simpleCourse();
  let courseRegistrationService = new CourseRegistrationService([course], []);

  expect(courseRegistrationService.dropCourse("1", "10")).toStrictEqual({
    success: false,
    message: "Student with ID 1 not found",
  });
});

test("dropCourse fails if course not found", () => {
  let student: Student = simpleStudent({ currentCourses: ["10"] });
  let courseRegistrationService = new CourseRegistrationService([], [student]);

  expect(courseRegistrationService.dropCourse("1", "10")).toStrictEqual({
    success: false,
    message: "Course with ID 10 not found",
  });
});

test("dropCourse fails if student not registered for course", () => {
  let course: Course = simpleCourse();
  let student: Student = simpleStudent({ currentCourses: [] });
  let courseRegistrationService = new CourseRegistrationService(
    [course],
    [student]
  );

  expect(courseRegistrationService.dropCourse("1", "10")).toStrictEqual({
    success: false,
    message: "Student is not registered for code-10",
  });
});

test("getEligibleCourses returns only courses student can register for", () => {
  let student: Student = simpleStudent({
    completedCourses: ["11"],
    maxCreditHours: 3,
  });
  let course1: Course = simpleCourse({
    id: "10",
    code: "code-10",
    creditHours: 2,
    prerequisites: ["11"],
    availableSeats: 1,
  });
  let course2: Course = simpleCourse({
    id: "11",
    code: "code-11",
    creditHours: 1,
    availableSeats: 1,
  });
  let course3: Course = simpleCourse({
    id: "12",
    code: "code-12",
    creditHours: 2,
    prerequisites: ["99"],
    availableSeats: 1,
  });
  let course4: Course = simpleCourse({
    id: "13",
    code: "code-13",
    creditHours: 2,
    prerequisites: [],
    availableSeats: 0,
  });
  let course5: Course = simpleCourse({
    id: "14",
    code: "code-14",
    creditHours: 2,
    prerequisites: [],
    availableSeats: 1,
  });

  let courseRegistrationService = new CourseRegistrationService(
    [course1, course2, course3, course4, course5],
    [student]
  );

  expect(
    courseRegistrationService
      .getEligibleCourses("1")
      .map((c) => c.id)
      .sort()
  ).toStrictEqual(["10", "11", "14"]);

  courseRegistrationService.registerForCourse("1", "10");

  expect(
    courseRegistrationService
      .getEligibleCourses("1")
      .map((c) => c.id)
      .sort()
  ).toStrictEqual(["11"]);
});

test("registerForCourse fails if no seats available", () => {
  let course: Course = simpleCourse({ availableSeats: 0 });
  let student: Student = simpleStudent();
  let courseRegistrationService = new CourseRegistrationService(
    [course],
    [student]
  );

  expect(courseRegistrationService.registerForCourse("1", "10")).toStrictEqual({
    success: false,
    message: "No available seats for course code-10",
  });
});

test("getEligibleCourses returns empty array if student not found", () => {
  let course: Course = simpleCourse();
  let courseRegistrationService = new CourseRegistrationService([course], []);
  expect(courseRegistrationService.getEligibleCourses("1")).toStrictEqual([]);
});
