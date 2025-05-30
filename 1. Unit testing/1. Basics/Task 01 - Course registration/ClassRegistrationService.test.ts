import { it, expect, describe, beforeEach } from 'vitest'
import { Student,Course, CourseRegistrationService } from './ClassRegistrationService'


describe('ClassRegistrationService - dropCourse', () => {

    let student: Student;
    let enrolledCourse: Course;
    let availableCourse: Course;
    let service: CourseRegistrationService;


    beforeEach(() => {
        student = {
        id: 'S1',
        name: 'Kowalski',
        completedCourses: ['C1'],
        currentCourses: ['C2'],
        maxCreditHours: 15,
        };

        enrolledCourse = {
        id: 'C2',
        code: 'code1',
        name: 'Hurtownie',
        creditHours: 3,
        availableSeats: 10,
        prerequisites: ['C1'],
        schedule: [
            { day: 'Monday', startTime: '11:15', endTime: '13:00', location: 'D2 333' },
        ],
        };

        availableCourse = {
        id: 'C3',
        code: 'code2',
        name: 'Bazy Danych',
        creditHours: 3,
        availableSeats: 15,
        prerequisites: ['C1'],
        schedule: [
            { day: 'Wednesday', startTime: '09:15', endTime: '11:00', location: 'D1 313' },
        ],
        };

        service = new CourseRegistrationService([availableCourse, enrolledCourse], [student])
    });


    it('should succeed if student drops a course they were registered for', () => {

        const result = service.dropCourse('S1', 'C2');

        expect(result).toMatchObject({success: true});
        expect(result).toHaveProperty('message');
        expect(result.message).toMatch(/success/i);
        expect(result.registeredCourse).toBeUndefined();

    });
    
    it('should fail if student drops a course they were not registered for', () => {

        const result = service.dropCourse('S1', 'C3');

        expect(result).toMatchObject({success: false});
        expect(result).toHaveProperty('message');
        expect(result.message).toMatch(/not registered/i);
        expect(result.registeredCourse).toBeUndefined();

    });

    it('should fail if student does not exist', () => {

        const result = service.dropCourse('S3', 'C3');

        expect(result).toMatchObject({success: false});
        expect(result).toHaveProperty('message');
        expect(result.message).toMatch(/not found/i);
        expect(result.registeredCourse).toBeUndefined();

    });

    it('should fail if course does not exist', () => {

        const result = service.dropCourse('S1', 'C4');

        expect(result).toMatchObject({success: false});
        expect(result).toHaveProperty('message');
        expect(result.message).toMatch(/not found/i);
        expect(result.registeredCourse).toBeUndefined();

    });

    it('should add seats if dropped successfully', () => {

        service.dropCourse('S1', 'C2');

        expect(service.getCourse('C2')?.availableSeats).toBe(11);

    });

    it('should remove course from currentCourses if dropped successfully', () => {

        service.dropCourse('S1', 'C2');

        expect(service.getStudent('S1')?.currentCourses).toHaveLength(0);

    });

    it('should not add seats if drop failed', () => {

        service.dropCourse('S1', 'C3');

        expect(service.getCourse('C2')?.availableSeats).toBe(10);

    });

    it('should not remove course from currentCourses if drop failed', () => {

        service.dropCourse('S1', 'C3');

        expect(service.getStudent('S1')?.currentCourses).toHaveLength(1);

    });
    
})