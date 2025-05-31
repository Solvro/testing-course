import { describe, it, expect, beforeEach } from 'vitest'
import {
    CourseRegistrationService,
    type Course,
    type Student,
} from './ClassRegistrationService'

describe('CourseRegistrationService — registerForCourse()', () => {
    let service: CourseRegistrationService
    let student: Student
    let baseCourse: Course

    beforeEach(() => {
        student = {
            id: 'student-1',
            name: 'Jan',
            completedCourses: [],
            currentCourses: [],
            maxCreditHours: 6,
        }

        baseCourse = {
            id: 'course-1',
            code: 'CS101',
            name: 'Intro to Programming',
            creditHours: 3,
            availableSeats: 1,
            prerequisites: [],
            schedule: [
                { day: 'Monday', startTime: '10:00', endTime: '12:00', location: 'Room A' },
            ],
        }

        service = new CourseRegistrationService([baseCourse], [student])
    })

    it('fails if student does not exist', () => {
        const result = service.registerForCourse('invalid-student', baseCourse.id)
        expect(result.success).toBe(false)
        expect(result.message).toBe(`Student with ID invalid-student not found`)
    })

    it('fails if course does not exist', () => {
        const result = service.registerForCourse(student.id, 'invalid-course')
        expect(result.success).toBe(false)
        expect(result.message).toBe(`Course with ID invalid-course not found`)
    })

    it('fails if student is already registered', () => {
        student.currentCourses.push(baseCourse.id)
        service = new CourseRegistrationService([baseCourse], [student])

        const result = service.registerForCourse(student.id, baseCourse.id)
        expect(result.success).toBe(false)
        expect(result.message).toBe(`Student is already registered for ${baseCourse.code}`)
    })

    it('fails if prerequisites are not met', () => {
        const advancedCourse: Course = {
            ...baseCourse,
            id: 'course-2',
            code: 'ML-ADV',
            prerequisites: ['course-missing'],
        }

        service = new CourseRegistrationService([advancedCourse], [student])

        const result = service.registerForCourse(student.id, advancedCourse.id)
        expect(result.success).toBe(false)
        expect(result.message).toContain('Missing prerequisites')
    })

    it('fails if schedule conflict occurs', () => {
        const conflictingCourse: Course = {
            ...baseCourse,
            id: 'course-3',
            code: 'CS201',
            schedule: [
                { day: 'Monday', startTime: '11:00', endTime: '13:00', location: 'Room B' },
            ],
        }

        student.currentCourses.push(baseCourse.id)
        service = new CourseRegistrationService([baseCourse, conflictingCourse], [student])

        const result = service.registerForCourse(student.id, conflictingCourse.id)
        expect(result.success).toBe(false)
        expect(result.message).toContain('Schedule conflict')
    })

    it('fails if no seats are available', () => {
        const fullCourse: Course = {
            ...baseCourse,
            id: 'course-4',
            code: 'CS301',
            availableSeats: 0,
        }

        service = new CourseRegistrationService([fullCourse], [student])

        const result = service.registerForCourse(student.id, fullCourse.id)
        expect(result.success).toBe(false)
        expect(result.message).toBe(`No available seats for course ${fullCourse.code}`)
    })

    it('fails if credit hour limit would be exceeded', () => {
        const extraCourse: Course = {
            ...baseCourse,
            id: 'course-5',
            code: 'CS400',
            creditHours: 4,
            schedule: [
                { day: 'Friday', startTime: '08:00', endTime: '10:00', location: 'Room C' },
            ],
        }

        student.currentCourses.push(baseCourse.id)
        service = new CourseRegistrationService([baseCourse, extraCourse], [student])

        const result = service.registerForCourse(student.id, extraCourse.id)
        expect(result.success).toBe(false)
        expect(result.message).toContain('exceed the maximum')
    })

    it('succeeds when all conditions are met', () => {
        const result = service.registerForCourse(student.id, baseCourse.id)

        expect(result.success).toBe(true)
        expect(result.message).toBe(`Successfully registered for ${baseCourse.code}`)
        expect(result.registeredCourse?.id).toBe(baseCourse.id)

        const updatedStudent = service.getStudent(student.id)
        expect(updatedStudent?.currentCourses).toContain(baseCourse.id)

        const updatedCourse = service.getCourse(baseCourse.id)
        expect(updatedCourse?.availableSeats).toBe(0)
    })
})
