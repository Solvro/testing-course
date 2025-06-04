import {beforeEach, describe, expect, it} from "vitest";
import {Course, CourseRegistrationService, RegistrationResult, Student} from "./ClassRegistrationService";

function generateStudent(id: string): Student {
    return {
        id,
        name: 'test',
        completedCourses: [],
        currentCourses: [],
        maxCreditHours: 1
    } as Student;
}

function generateCourse(id: string): Course {
    return {
        id,
        code: 'test-1',
        name: 'testCourse',
        creditHours: 1,
        availableSeats: 1,
        prerequisites: [],
        schedule: [
            {day: "Friday", startTime: "13:15", endTime: "14.45", location: "testRoom"}
        ]
    } as Course;
}

function assertFailureResult(result: RegistrationResult, expectedMessage?: string) {
    expect(result.success).toBe(false);
    if (expectedMessage !== undefined) expect(result.message).toBe(expectedMessage);
}

function assertSuccessResult(result: RegistrationResult, expectedMessage?: string) {
    expect(result.success).toBe(true);
    if (expectedMessage !== undefined) expect(result.message).toBe(expectedMessage);
}

function getStudentOrFail(service: CourseRegistrationService, id: string): Student {
    const student = service.getStudent(id);
    expect(student).toBeDefined();
    return student;
}

function getCourseOrFail(service: CourseRegistrationService, id: string): Course {
    const course = service.getCourse(id);
    expect(course).toBeDefined();
    return course;
}

describe("dropCourse", () => {
    let registrationService: CourseRegistrationService;
    const studentId = '1';
    const courseId = '11';

    beforeEach(() => {
        registrationService = new CourseRegistrationService([generateCourse(courseId)], [generateStudent(studentId)])
    })

    it("should fail if student doesn't exist", () => {
        const invalidStudentId = studentId + '1';
        assertFailureResult(registrationService.dropCourse(invalidStudentId, courseId), `Student with ID ${invalidStudentId} not found`);
    });

    it("should fail if course doesn't exist", () => {
        const invalidCourseId = courseId + '1';
        assertFailureResult(registrationService.dropCourse(studentId, invalidCourseId), `Course with ID ${invalidCourseId} not found`);
    });

    it("should fail with no registration", () => {
        assertFailureResult(registrationService.dropCourse(studentId, courseId));
    });

    function registerForCourse(studentId: string, courseId: string, service: CourseRegistrationService) {
        const course = getCourseOrFail(service, courseId);
        const student = getStudentOrFail(service, studentId);
        expect(student.currentCourses.push(courseId)).toBeDefined();
        course.availableSeats--;
    }

    it("should update on registration", () => {
        registerForCourse(studentId, courseId, registrationService);
        const seatsBefore = registrationService.getCourse(courseId)?.availableSeats;
        const result = registrationService.dropCourse(studentId, courseId);
        assertSuccessResult(result);
        const course = getCourseOrFail(registrationService, courseId);
        expect(course.availableSeats).toEqual(seatsBefore + 1);
        const student = getStudentOrFail(registrationService, studentId);
        expect(student.currentCourses.includes(courseId)).toBe(false);
    });
});


describe("getEligibleCourses", () => {
    let registrationService: CourseRegistrationService;

    function generateCourseWithMissingPrerequisites(id: string): Course {
        const course = generateCourse(id);
        course.prerequisites = ['111'];
        return course;
    }

    function generateCourseWithCreditHoursLimit(id: string): Course {
        const course = generateCourse(id);
        course.creditHours = 99999999;
        return course;
    }

    function generateCourseWithNoSeats(id: string): Course {
        const course = generateCourse(id);
        course.availableSeats = 0;
        return course;
    }

    it("should return empty array if student doesn't exist", () => {
        const studentId = '1';
        const invalidStudentId = studentId + '1';
        registrationService = new CourseRegistrationService([], [generateStudent(studentId)]);
        expect(registrationService.getEligibleCourses(invalidStudentId).length).toEqual(0);
    });

    it("should return empty array if no courses match - missing prerequisites", () => {
        const studentId = '1';
        registrationService = new CourseRegistrationService([generateCourseWithMissingPrerequisites('1')], [generateStudent(studentId)]);
        expect(registrationService.getEligibleCourses(studentId).length).toEqual(0);
    });

    it("should return empty array if no courses match - no seats", () => {
        const studentId = '1';
        registrationService = new CourseRegistrationService([generateCourseWithNoSeats('1')], [generateStudent(studentId)]);
        expect(registrationService.getEligibleCourses(studentId).length).toEqual(0);
    });

    it("should return empty array if no courses match - credit hour limit exceeded", () => {
        const studentId = '1';
        registrationService = new CourseRegistrationService([generateCourseWithCreditHoursLimit('1')], [generateStudent(studentId)]);
        expect(registrationService.getEligibleCourses(studentId).length).toEqual(0);
    });

    it("should return valid courses", () => {
        const studentId = '1';
        const courseId = '1';
        registrationService = new CourseRegistrationService([
                generateCourseWithMissingPrerequisites(courseId + '1'),
                generateCourseWithNoSeats(courseId + '2'),
                generateCourseWithCreditHoursLimit(courseId + '3'),
                generateCourse(courseId)
            ],
            [generateStudent(studentId)]);
        const result = registrationService.getEligibleCourses(studentId);
        expect(result.length).toEqual(1);
        expect(result[0].id).toEqual(courseId);
    });
});