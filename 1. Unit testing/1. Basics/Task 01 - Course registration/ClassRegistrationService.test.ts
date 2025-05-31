import { describe, test, it, expect, beforeEach} from "vitest";
import { Student, CourseRegistrationService, Course, ClassSchedule } from "./ClassRegistrationService";

describe('registerForCourse()', () => {

    let crs: CourseRegistrationService
    let baseStudent: Student
    let baseSchedule: ClassSchedule
    let baseCourse: Course, conflictCourse: Course, preCourse: Course, seatCourse: Course
    

    beforeEach(() => {
        baseStudent = {
            id: "1",
            name: "student-name",
            completedCourses: [],
            currentCourses: [],
            maxCreditHours: 10
        }

        baseSchedule = {
            day: "Monday",
            startTime: "17:00",
            endTime: "20:00",
            location: "remote"
        }

        baseCourse = {
            id: "1",
            code: "CS-2137",
            name: "Introduction to JS Tests.",
            creditHours: 3,
            availableSeats: 5,
            prerequisites: [],
            schedule: [baseSchedule]
        }

        preCourse  = {
            ...baseCourse,
            id: "6",
            prerequisites: ["3"] 
        }

        conflictCourse = {
            ...baseCourse,
            id: "2",
            schedule: [{
                ...baseSchedule,
                startTime: "18:00",
                endTime: "19:00"
            }]

        }

        seatCourse = {
            ...baseCourse,
            id: "5",
            availableSeats: 0
        }

        crs = new CourseRegistrationService([baseCourse, conflictCourse, preCourse, seatCourse], [baseStudent])
    })

    it("should fail if student with given ID was not found", () => {
        const result = crs.registerForCourse("non-existing student ID", baseCourse.id)

        expect(result).toMatchObject({"success": false})
        expect(result.message).toMatch(/not found/i)
    })

    it("should fail if course with given ID was not found", () => {
        const result = crs.registerForCourse(baseStudent.id, "-1")

        expect(result).toMatchObject({"success": false})
        expect(result.message).toMatch(/not found/i)
    })

    it("should fail if student has already applied to the course", () => {
        baseStudent.currentCourses.push(baseCourse.id)
        const result = crs.registerForCourse(baseStudent.id, baseCourse.id)

        expect(result).toMatchObject({"success": false})
        expect(result.message).toMatch(/already registered/i)
        
    })

    it("should fail if prerequities are not met", () => {
        const result = crs.registerForCourse(baseStudent.id, preCourse.id)
        expect(result).toMatchObject({"success": false})
        expect(result.message).toMatch(/Missing prerequisites/i)
    })

    it("should fail if schedule conflict exists", () => {
        baseStudent.currentCourses.push("1")
        const result = crs.registerForCourse(baseStudent.id, conflictCourse.id) 
        expect(result).toMatchObject({"success": false})
        expect(result.message).toMatch(/Schedule conflict/i)
    })

    it("should fail if no seats available", () => {
        const result = crs.registerForCourse(baseStudent.id, seatCourse.id) 
        expect(result).toMatchObject({"success": false})
        expect(result.message).toMatch(/No available seats/i)
    })

    it("should fail if not enough credith hours", () => {
        baseStudent.maxCreditHours = 0
        const result = crs.registerForCourse(baseStudent.id, baseCourse.id) 
        expect(result).toMatchObject({"success": false})
        expect(result.message).toMatch(/exceed the maximum/i)
    })

    it("should succeed if all checks passed", () => {
        const result = crs.registerForCourse(baseStudent.id, baseCourse.id) 
        expect(result).toMatchObject({"success": true})
        expect(result.message).toMatch(/Successfully/i)
    })

})