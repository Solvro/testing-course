import { Student, Course } from './ClassRegistrationService';

export const generateStudent = (id: string, name: string = "John Dickson"): Student => {
    return {
        id,
        name,
        completedCourses: [],
        currentCourses: [],
        maxCreditHours: 30
    };
};

export const generateCourse = (id: string, code: string = "BSC", name: string = "Example Course", creditHours: number = 3): Course => {
    return {
        id,
        code,
        name,
        creditHours,
        availableSeats: 10,
        prerequisites: [], // Course IDs that must be completed
        schedule: []
    };
};