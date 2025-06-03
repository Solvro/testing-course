import {describe, it, expect, beforeAll, beforeEach} from 'vitest';
import {CourseRegistrationService} from './ClassRegistrationService';
import {type Course} from './ClassRegistrationService';
import { generateCourse, generateStudent } from './helper';

describe('GetCourse', () => {
  let registrationService: CourseRegistrationService;

  beforeAll(() => {
    const courses: Course[] = [
      generateCourse('course1', 'CS101', 'Tajne techniki refaktoryzacji', 3),
      generateCourse('course2', 'CS102', 'Tworzenie oprogramowania niezbednego', 4),
      generateCourse('course3', 'CS103', 'Analiza pojazdow dwukolowych', 5)
    ];

    registrationService = new CourseRegistrationService(courses, []);
  });

  it.each([
    ['course1', 'CS101'],
    ['course2', 'CS102'],
    ['course3', 'CS103'],
  ])('should return course with id %s and code %s', (courseId, expectedCode) => {
    const course = registrationService.getCourse(courseId);
    expect(course).toBeDefined();
    expect(course?.code).toBe(expectedCode);
  });

  it('should return undefined for non-existing course', () => {
    const course = registrationService.getCourse('Kurs Bozeny');
    expect(course).toBeUndefined();
  })
});

describe('GetStudent', () => {
  let registrationService: CourseRegistrationService;

  beforeAll(() => {
    const courses: Course[] = [];
    const students = [
      generateStudent('student1', 'Artur Pendragon'),
      generateStudent('student2', 'Zbigniew Stonoga'),
    ];

    registrationService = new CourseRegistrationService(courses, students);
  });

  it.each([
    ['student1', 'Artur Pendragon'],
    ['student2', 'Zbigniew Stonoga'],
  ])('should return student with id %s and name %s', (studentId, expectedName) => {
    const student = registrationService.getStudent(studentId);
    expect(student).toBeDefined();
    expect(student?.name).toBe(expectedName);
  });

  it('should return undefined for non-existing student', () => {
    const student = registrationService.getStudent('student3');
    expect(student).toBeUndefined();
  });
})

describe('RegisterForCourse', () => {
    let registrationService: CourseRegistrationService;
    
    beforeEach(() => {
        const courses: Course[] = [
            generateCourse('course1', 'CS101', 'Tajne techniki refaktoryzacji', 3),
            generateCourse('course2', 'CS102', 'Tworzenie oprogramowania niezbednego', 4),
        ];
        const students = [
            generateStudent('student1', 'Artur Pendragon'),
            generateStudent('student2', 'Zbigniew Stonoga'),
        ];
    
        registrationService = new CourseRegistrationService(courses, students);
    });
    
    it('should register student for course', () => {
        const result = registrationService.registerForCourse('student1', 'course1');
        expect(result?.success).toBe(true);

        const student = registrationService.getStudent('student1');
        expect(student).toBeDefined();
        expect(student?.currentCourses).toContain('course1');
    });

    it('should not register student twice for the same course', () => {
        registrationService.registerForCourse('student1', 'course1');
        const result = registrationService.registerForCourse('student1', 'course1');
        expect(result?.success).toBe(false);
        expect(result?.message).toMatch(/already registered/);
    });

    it('should not register non-existing student for course', () => {
        const result = registrationService.registerForCourse('student3', 'course1');
        expect(result?.success).toBe(false);
        expect(result?.message).toMatch(/Student.*not found/);
    });

    it('should not register student for non-existing course', () => {
        const result = registrationService.registerForCourse('student1', 'course3');
        expect(result?.success).toBe(false);
        expect(result?.message).toMatch(/Course.*not found/);
    });

    it('should not register student with no prerequisites for course', () => {
        const course = generateCourse('course1', 'CS101', "Nie lubimy kursu", 10);
        course.prerequisites = ['CS102'];
        const student = generateStudent('student1', 'Obijacz Podlogowski');

        registrationService = new CourseRegistrationService([course], [student]);

        const result = registrationService.registerForCourse('student1', 'course1');
        expect(result?.success).toBe(false);
        expect(result?.message).toMatch(/Missing prerequisites/);
    });

    it('should not register student for course with full capacity', () => {
        const course = generateCourse('course1', 'CS101', 'Pusty kursik', 1);
        course.availableSeats = 0;
        const student = generateStudent('student1', 'Zbigniew Stonoga');

        registrationService = new CourseRegistrationService([course], [student]);

        const result = registrationService.registerForCourse('student1', 'course1');
        expect(result?.success).toBe(false);
        expect(result?.message).toMatch(/No available seats/);
    });

    it('should not register student for course with overlapping time', () => {
        const course1 = generateCourse('course1', 'CS101', 'Kurs 1', 3);
        course1.schedule = [{
            startTime: "10:00",
            endTime: "12:00",
            day: "Monday",
            location: "Room 101"
        }];

        const course2 = generateCourse('course2', 'CS102', 'Kurs 2', 3);
        course2.schedule = [{
            startTime: "11:00",
            endTime: "13:00",
            day: "Monday",
            location: "Room 123"
        }];

        const student = generateStudent('student1', 'Jas Fasola');

        registrationService = new CourseRegistrationService([course1, course2], [student]);
        registrationService.registerForCourse('student1', 'course1');

        const result = registrationService.registerForCourse('student1', 'course2');
        expect(result?.success).toBe(false);
        expect(result?.message).toMatch(/Schedule conflict/);
    });

    it('should not register student for course if credits exceed limit', () => {
        const course1 = generateCourse('course1', 'CS101', 'Kurs 1', 3);
        const course2 = generateCourse('course2', 'CS102', 'Kurs 2', 4);
        const student = generateStudent('student1', 'Jacek Murawa');
        student.maxCreditHours = 5;

        registrationService = new CourseRegistrationService([course1, course2], [student]);
        registrationService.registerForCourse('student1', 'course1');

        const result = registrationService.registerForCourse('student1', 'course2');
        expect(result?.success).toBe(false);
        expect(result?.message).toMatch(/exceed the maximum.*credit hours/);
    });
})