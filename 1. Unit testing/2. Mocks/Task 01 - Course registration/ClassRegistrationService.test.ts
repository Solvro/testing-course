import {
  it,
  expect,
  describe,
  beforeEach,
  afterEach,
  vi,
  afterAll,
  beforeAll,
} from "vitest";
import { CourseRegistrationService } from "./ClassRegistrationService";
import { db } from "../utils/db";

vi.mock("pg", () => {
  return { Pool: vi.fn() };
}); //THANK YOU ANIA :prayer emoji: :fire emoji:

vi.mock("../utils/db");

//man these are a mess but i realized too late
const classSchedules = [
  {
    day: "Monday",
    startTime: "13:15",
    endTime: "14:45",
    location: "D-2",
  },
  {
    day: "Monday",
    startTime: "13:15",
    endTime: "14:45",
    location: "D-2",
  },
  {
    day: "Tuesday",
    startTime: "13:15",
    endTime: "14:45",
    location: "D-2",
  },
] as const; //fixes ts error with not knowing if day matches the type

const ogCourses = [
  {
    id: "0", //normal course
    code: "KURS-1",
    name: "Hurtownie danych",
    creditHours: 12,
    availableSeats: 3,
    prerequisites: [],
    schedule: [classSchedules[0]],
  },
  {
    id: "1", //course with prereqs
    code: "KURS-2",
    name: "Architektura Komputerów",
    creditHours: 12,
    availableSeats: 1,
    prerequisites: ["1"],
    schedule: [classSchedules[1]],
  },
  {
    id: "2", //normal course
    code: "KURS-3",
    name: "Sztuczna Inteligencja",
    creditHours: 12,
    availableSeats: 1,
    prerequisites: [],
    schedule: [classSchedules[2]],
  },
  {
    id: "3", //large credithours course
    code: "KURS-4",
    name: "Analiza II",
    creditHours: 40,
    availableSeats: 1,
    prerequisites: [],
    schedule: [classSchedules[2]],
  },
  {
    //unavailable course
    id: "4",
    code: "KURS-5",
    name: "Fizyka II",
    creditHours: 40,
    availableSeats: 0,
    prerequisites: [],
    schedule: [classSchedules[2]],
  },
];

const ogStudents = [
  {
    id: "272669",
    name: "Natalia M",
    completedCourses: [],
    currentCourses: [],
    maxCreditHours: 12,
  },
  {
    id: "272690",
    name: "Jakub C",
    completedCourses: ["0"],
    currentCourses: ["1"],
    maxCreditHours: 30,
  },
  {
    id: "272666",
    name: "Wojciech K",
    completedCourses: [],
    currentCourses: [],
    maxCreditHours: 10,
  },
  {
    id: "272600",
    name: "Pola A",
    completedCourses: [],
    currentCourses: [],
    maxCreditHours: 40,
  },
];

let service: CourseRegistrationService;
let students: typeof ogStudents; //needed for a deepcopy/structuredclone during course registering tests
let courses: typeof ogCourses;

//i have tested this method previously, i am just extending it a little to learn db mocking.
//due to the feedback i am also extending this TC for 2 positive scenarios
describe("registerCourse", () => {
  beforeAll(() => {
    //resolve time
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 1, 1));
  });
  beforeEach(() => {
    //deepcopy modified objects
    students = structuredClone(ogStudents);
    courses = structuredClone(ogCourses);

    //vi.mocked(db).sql = vi.fn();
    //instead of the above, im going to mock db implementation db.sql(query, params)
    //i tried without it and with mockResolvedValue but it was a damn good spaghetti, carbonara even
    vi.mocked(db).sql.mockImplementation(
      async (query: string, params?: any[]) => {
        if (query.startsWith("SELECT * FROM students")) {
          const studentId = params?.[0]; //check for params with ?.
          return students.filter((s) => s.id === studentId);
        }
        if (
          query.startsWith("SELECT * FROM courses") &&
          query.includes("WHERE id")
        ) {
          const courseId = params?.[0];
          return courses.filter((c) => c.id === courseId);
        }
        if (query.startsWith("SELECT * FROM courses")) {
          return courses;
        }
        if (query.startsWith("UPDATE students SET")) {
          //probably would have to implement this if i tested registerForCourse more thoroughly, for now let it be
          //would have to get params, find student/course by id, update it manually etc. - to check aval. seats for example
          return [];
        }
        if (query.startsWith("UPDATE courses SET")) {
          return [];
        }
        return [];
      }
    );
    service = new CourseRegistrationService();
  });

  afterAll(() => {
    vi.useRealTimers();
    students = structuredClone(ogStudents);
    courses = structuredClone(ogCourses);
  });

  it("should allow registering multiple different students to one course within boundaries", async () => {
    const studentIds = ["272669", "272600"];
    for (const studentId of studentIds) {
      const result = await service.registerForCourse(studentId, "0");
      expect(result.success).toBe(true);
    }
  });

  it("should allow registering one student to multiple different courses within boundaries", async () => {
    const courseIds = ["0", "2"];
    for (const courseId of courseIds) {
      const result = await service.registerForCourse("272600", courseId);
      expect(result.success).toBe(true);
    }
  });
});

//previously untested method here
describe("getEligibleCourses", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 1, 1));
    vi.mocked(db).sql = vi.fn();
    service = new CourseRegistrationService();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return an empty array for a non-existing student", async () => {
    vi.mocked(db.sql)
      .mockResolvedValueOnce([]) //first get student
      .mockResolvedValueOnce(courses); //then all the courses
    const result = await service.getEligibleCourses("NON-EXISTENT-ID");
    expect(result).toEqual([]);
  });

  it("should return an empty array for a student with a hour limit", async () => {
    vi.mocked(db.sql)
      .mockResolvedValueOnce([students[2]])
      .mockResolvedValueOnce(courses);
    const result = await service.getEligibleCourses("272666");
    expect(result).toEqual([]);
  });

  //this one is probably ugly but i dont really know how to do it better (for now!)
  //update: so basically i did this BEFORE registerForCourse so i guess the db mocking could be also applied here? im open for feedback here
  it("should only return eligible courses that are not currently being taken", async () => {
    vi.mocked(db.sql)
      .mockResolvedValueOnce([students[1]])
      .mockResolvedValueOnce(courses) //5 courses - 1 already taken - 1 without available seats = 3
      .mockResolvedValueOnce([courses[0]]) //3 remaining courses are checked in checkPrerequisites
      .mockResolvedValueOnce([courses[2]])
      .mockResolvedValueOnce([courses[3]]); //should get rejected cuz of credithours

    const result = await service.getEligibleCourses("272690");
    expect(result).toEqual([courses[0], courses[2]]); //["0", "2"]
  });

  it("should only return eligible courses with available seats and valid credit hours", async () => {
    vi.mocked(db.sql)
      .mockResolvedValueOnce([students[0]])
      .mockResolvedValueOnce(courses);
    const result = await service.getEligibleCourses("272669");
    expect(result).toEqual([courses[0], courses[2]]); //["0", "2"]
  });
});
