import { ClassSchedule, Course, Student } from "./ClassRegistrationService";

export const STUDENTS_MOCK: Student[] = [
  {
    id: "s1",
    name: "Anna Kowalska",
    completedCourses: ["c1"],
    currentCourses: ["c2"],
    maxCreditHours: 18,
  },
  {
    id: "s2",
    name: "Jan Nowak",
    completedCourses: ["c1", "c2"],
    currentCourses: [],
    maxCreditHours: 21,
  },
  {
    id: "s3",
    name: "Maria Wiśniewska",
    completedCourses: [],
    currentCourses: [],
    maxCreditHours: 15,
  },
  {
    id: "s4",
    name: "Janusz Jędrzejewski",
    completedCourses: ["c2"],
    currentCourses: ["c3"],
    maxCreditHours: 15,
  },
  {
    id: "s5",
    name: "Mariusz Jemioła",
    completedCourses: ["c5"],
    currentCourses: ["c1", "c6"],
    maxCreditHours: 10,
  },
];

const SCHEDULES_MOCK: ClassSchedule[] = [
  {
    day: "Monday",
    startTime: "08:00",
    endTime: "09:30",
    location: "Room 101, Building A",
  },
  {
    day: "Thursday",
    startTime: "14:00",
    endTime: "16:00",
    location: "Room 105, Building A",
  },
  {
    day: "Friday",
    startTime: "09:00",
    endTime: "12:00",
    location: "Auditorium, Building D",
  },
  {
    day: "Wednesday",
    startTime: "17:00",
    endTime: "19:00",
    location: "Auditorium, Building D",
  },
];

export const COURSES_MOCK: Course[] = [
  {
    id: "c1",
    code: "CS101",
    name: "Introduction to Programming",
    creditHours: 3,
    availableSeats: 5,
    prerequisites: [],
    schedule: [SCHEDULES_MOCK[0]],
  },
  {
    id: "c2",
    code: "CS102",
    name: "Data Structures",
    creditHours: 4,
    availableSeats: 2,
    prerequisites: ["c1"],
    schedule: [SCHEDULES_MOCK[1], SCHEDULES_MOCK[2]],
  },
  {
    id: "c3",
    code: "CS201",
    name: "Algorithms",
    creditHours: 5,
    availableSeats: 1,
    prerequisites: ["c2"],
    schedule: [SCHEDULES_MOCK[2]],
  },
  {
    id: "c4",
    code: "CS202",
    name: "UI&UX",
    creditHours: 12,
    availableSeats: 1,
    prerequisites: ["c2"],
    schedule: [SCHEDULES_MOCK[2]],
  },
  {
    id: "c5",
    code: "CS203",
    name: "LLMs",
    creditHours: 4,
    availableSeats: 0,
    prerequisites: [],
    schedule: [SCHEDULES_MOCK[1]],
  },
  {
    id: "c6",
    code: "CS204",
    name: "LLMs v2",
    creditHours: 8,
    availableSeats: 0,
    prerequisites: ["c5"],
    schedule: [SCHEDULES_MOCK[3]],
  },
  {
    id: "c7",
    code: "CS205",
    name: "Artificial Intelligence",
    creditHours: 4,
    availableSeats: 5,
    prerequisites: [],
    schedule: [SCHEDULES_MOCK[1]],
  },
];
