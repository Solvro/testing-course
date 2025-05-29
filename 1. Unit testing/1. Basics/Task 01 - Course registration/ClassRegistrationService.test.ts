import { beforeEach, describe, expect, it } from "vitest";
import { STUDENTS_MOCK, COURSES_MOCK } from "./mock";
import { CourseRegistrationService } from "./ClassRegistrationService";

describe("[CourseRegistrationService]:[getCourse]", () => {
  let CRS;

  beforeEach(() => {
    CRS = new CourseRegistrationService(COURSES_MOCK, STUDENTS_MOCK);
  });

  it("should return a correct course by passing an id", () => {
    const expectedCourse = COURSES_MOCK[0];
    const course = CRS.getCourse(expectedCourse.id);
    expect(course).haveOwnProperty("name", expectedCourse.name);
    expect(course).haveOwnProperty("code", expectedCourse.code);
  });

  it("should return undefined if passed an id of a course that doesn't exist", () => {
    expect(CRS.getCourse("c0")).toBeUndefined();
  });

  it.each([
    { id: null, result: undefined },
    { id: undefined, result: undefined },
    { id: true, result: undefined },
    { id: false, result: undefined },
    { id: 1, result: undefined },
    { id: "", result: undefined },
  ])("should return $result if passed an id of type $id", ({ id, result }) => {
    expect(CRS.getCourse(id)).toBe(result);
  });
});

describe("[CourseRegistrationService]:[getStudent]", () => {
  let CRS;

  beforeEach(() => {
    CRS = new CourseRegistrationService(COURSES_MOCK, STUDENTS_MOCK);
  });

  it("should return a correct student by passing an id", () => {
    const expectedStudent = STUDENTS_MOCK[0];
    const student = CRS.getStudent(expectedStudent.id);
    expect(student).haveOwnProperty("name", student.name);
  });

  it("should return undefined if passed an id of a student that doesn't exist", () => {
    expect(CRS.getStudent("s0")).toBeUndefined();
  });

  it.each([
    { id: null, result: undefined },
    { id: undefined, result: undefined },
    { id: true, result: undefined },
    { id: false, result: undefined },
    { id: 1, result: undefined },
    { id: "", result: undefined },
  ])("should return $result if passed an id of type $id", ({ id, result }) => {
    expect(CRS.getStudent(id)).toBe(result);
  });
});

describe("[CourseRegistrationService]:[registerForCourse]", () => {
  let CRS;

  beforeEach(() => {
    CRS = new CourseRegistrationService(COURSES_MOCK, STUDENTS_MOCK);
  });

  it("should register a student for a course", () => {
    const courseId = COURSES_MOCK[0].id;
    const studentId = STUDENTS_MOCK[2].id;

    const registered = CRS.registerForCourse(studentId, courseId);
    expect(registered).haveOwnProperty("success", true);
    expect(registered).haveOwnProperty("message");
    expect(registered.message).toMatch(/registered/i);
  });

  it("should return error object caused by student inexistence", () => {
    const courseId = COURSES_MOCK[0].id;

    const registered = CRS.registerForCourse(null, courseId);
    expect(registered).haveOwnProperty("success", false);
    expect(registered.message).toMatch(/not found/i);
  });

  it("should return error object caused by course inexistence", () => {
    const studentId = STUDENTS_MOCK[0].id;

    const registered = CRS.registerForCourse(studentId, null);
    expect(registered).haveOwnProperty("success", false);
    expect(registered.message).toMatch(/not found/i);
  });

  it("should return error object caused by student double assign try", () => {
    const studentId = STUDENTS_MOCK[0].id;
    const courseId = COURSES_MOCK[1].id;

    const registered = CRS.registerForCourse(studentId, courseId);
    expect(registered).haveOwnProperty("success", false);
    expect(registered.message).toMatch(/already registered/i);
  });

  it("should return error object caused by missing prerequisites", () => {
    const studentId = STUDENTS_MOCK[2].id;
    const courseId = COURSES_MOCK[1].id;

    const registered = CRS.registerForCourse(studentId, courseId);
    expect(registered).haveOwnProperty("success", false);
    expect(registered.message).toMatch(/missing prerequisites/i);
  });

  it("should return error object caused by courses overlap", () => {
    const studentId = STUDENTS_MOCK[3].id;
    const courseId = COURSES_MOCK[3].id;

    const registered = CRS.registerForCourse(studentId, courseId);
    expect(registered).haveOwnProperty("success", false);
    expect(registered.message).toMatch(/conflict/i);
  });

  it("should return error object caused by empty course seats", () => {
    const studentId = STUDENTS_MOCK[2].id;
    const courseId = COURSES_MOCK[4].id;

    const registered = CRS.registerForCourse(studentId, courseId);
    expect(registered).haveOwnProperty("success", false);
    expect(registered.message).toMatch(/No available seats/i);
  });

  it("should return error object caused by exceed of student maximum hours", () => {
    const studentId = STUDENTS_MOCK[4].id;
    const courseId = COURSES_MOCK[6].id;

    const registered = CRS.registerForCourse(studentId, courseId);
    console.log(registered);
    expect(registered).haveOwnProperty("success", false);
    expect(registered.message).toMatch(/10 credit hours/i);
  });
});
