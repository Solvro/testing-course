import {
  afterAll,
  beforeAll,
  describe,
  vi,
  it,
  expect,
  afterEach,
} from "vitest";
import { db } from "../utils/db";
import {
  Course,
  CourseRegistrationService,
  Student,
} from "./ClassRegistrationService";

const createMockCourse = (overrides: Partial<Course> = {}): Course => ({
  id: "1",
  code: "cs",
  name: "Computer Science",
  creditHours: 1,
  availableSeats: 30,
  prerequisites: [],
  schedule: [],
  ...overrides,
});

const createMockStudent = (overrides: Partial<Student> = {}): Student => ({
  id: "1",
  name: "John Doe",
  completedCourses: [],
  currentCourses: [],
  maxCreditHours: 3,
  ...overrides,
});

vi.mock("../utils/db", () => ({
  db: {
    sql: vi.fn(),
  },
}));

const mockDb = vi.mocked(db);

describe("CourseRegistrationService", () => {
  let service: CourseRegistrationService;

  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 8, 1));

    service = new CourseRegistrationService();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  describe("constructor", () => {
    it("should throw an error when not in February or September", () => {
      vi.setSystemTime(new Date(2025, 5, 8));

      expect(() => new CourseRegistrationService()).toThrowError(
        /only available in/i
      );
    });

    it("should not throw error when in February", () => {
      vi.setSystemTime(new Date(2025, 1, 8));
      expect(() => new CourseRegistrationService()).not.toThrowError();
    });

    it("should not throw error when in September", () => {
      vi.setSystemTime(new Date(2025, 8, 8));
      expect(() => new CourseRegistrationService()).not.toThrowError();
    });
  });

  describe("getCourse", () => {
    it("should return a course when found", async () => {
      const mockCourse = createMockCourse();
      mockDb.sql.mockResolvedValueOnce([mockCourse]);

      const res = await service.getCourse(mockCourse.id);
      expect(res).toEqual(mockCourse);
      // shouldn't check how it was retrieved, we care only about end result
    });

    it("should return undefined when course is not found", async () => {
      mockDb.sql.mockResolvedValueOnce([]);

      const res = await service.getCourse("nonexistent");
      expect(res).toBeUndefined();
    });
  });

  describe("getStudent", () => {
    it("should return a student when found", async () => {
      const mockStudent = createMockStudent();
      mockDb.sql.mockResolvedValueOnce([mockStudent]);

      const res = await service.getStudent(mockStudent.id);
      expect(res).toEqual(mockStudent);
    });

    it("should return undefined when student is not found", async () => {
      mockDb.sql.mockResolvedValueOnce([]);

      const res = await service.getStudent("nonexistent");
      expect(res).toBeUndefined();
    });
  });

  describe("registerForCourse", () => {
    it("should return error if student not found", async () => {
      mockDb.sql.mockResolvedValueOnce([]);

      const res = await service.registerForCourse("nonexistent", "1");
      expect(res.success).toBeFalsy();
      expect(res.message).toContain("not found");
    });

    it("should return error if course not found", async () => {
      const mockStudent = createMockStudent();
      mockDb.sql.mockResolvedValueOnce([mockStudent]); // found a student
      mockDb.sql.mockResolvedValueOnce([]); // but not the course

      const res = await service.registerForCourse(
        mockStudent.id,
        "nonexistent"
      );
      expect(res.success).toBeFalsy();
      expect(res.message).toContain("not found");
    });

    it("should return error if student is already registered", async () => {
      const mockCourse = createMockCourse();
      const mockStudent = createMockStudent({
        currentCourses: [mockCourse.id],
      });

      mockDb.sql.mockResolvedValueOnce([mockStudent]);
      mockDb.sql.mockResolvedValueOnce([mockCourse]);

      const res = await service.registerForCourse(
        mockStudent.id,
        mockCourse.id
      );

      expect(res.success).toBeFalsy();
      expect(res.message).toContain("already registered");
    });

    it("should return error if prerequisites not met", async () => {
      const mockStudent = createMockStudent();
      const mockCourse = createMockCourse({
        prerequisites: ["prereq1", "prereq2"],
      });

      // need to mock implmentation because of complex calls

      mockDb.sql.mockImplementation(
        async (query: string, params?: unknown[]) => {
          if (query.match(/SELECT \* FROM students/i)) {
            return [mockStudent];
          }
          if (query.match(/SELECT \* FROM courses/i)) {
            const courseId = params?.[0] as string;
            // the course to register for
            if (courseId === mockCourse.id) {
              return [mockCourse];
            }
            // mocked prerequisite courses by ID
            if (courseId === "prereq1") {
              return [
                createMockCourse({
                  id: "prereq1",
                  code: "pr1",
                }),
              ];
            }
            if (courseId === "prereq2") {
              return [
                createMockCourse({
                  id: "prereq2",
                  code: "pr2",
                }),
              ];
            }
          }
          return [];
        }
      );

      const res = await service.registerForCourse(
        mockStudent.id,
        mockCourse.id
      );
      expect(res.success).toBeFalsy();
      expect(res.message).toContain("prerequisites");
    });

    it("should return error if prerequisites have self-dependency", async () => {
      const mockStudent = createMockStudent();
      const mockCourse = createMockCourse({
        prerequisites: ["prereq1", "prereq2", "1"], // <- inserting self-dependency (I'm pretty sure we are not checking that in original functoin)
      });

      // need to mock implmentation because of complex calls

      mockDb.sql.mockImplementation(
        async (query: string, params?: unknown[]) => {
          if (query.match(/SELECT \* FROM students/i)) {
            return [mockStudent];
          }
          if (query.match(/SELECT \* FROM courses/i)) {
            const courseId = params?.[0] as string;
            // the course to register for
            if (courseId === mockCourse.id) {
              return [mockCourse];
            }
            // mocked prerequisite courses by ID
            if (courseId === "prereq1") {
              return [
                createMockCourse({
                  id: "prereq1",
                  code: "pr1",
                }),
              ];
            }
            if (courseId === "prereq2") {
              return [
                createMockCourse({
                  id: "prereq2",
                  code: "pr2",
                }),
              ];
            }
          }
          return [];
        }
      );

      const res = await service.registerForCourse(
        mockStudent.id,
        mockCourse.id
      );
      expect(res.success).toBeFalsy();
      expect(res.message).toContain("prerequisites");
      expect(res.message).toContain("pr1");
      expect(res.message).toContain("pr2");
      expect(res.message).not.toContain(mockCourse.code); // self-depedency check
    });

    it("should return error if schedule confilct", async () => {
      const mockStudent = createMockStudent({ currentCourses: ["conflict"] });
      const mockCourse = createMockCourse();

      // need to mock implementation of db because this function can execute same queries multiple times

      mockDb.sql.mockImplementation(
        async (query: string, params?: unknown[]) => {
          if (query.match(/SELECT \* FROM students/i)) {
            return [
              createMockStudent({
                id: params?.[0] as string,
                currentCourses: mockStudent.currentCourses,
              }),
            ];
          }
          if (query.match(/SELECT \* FROM courses/i)) {
            return [
              createMockCourse({
                id: params?.[0] as string,
                schedule: [
                  {
                    day: "Monday",
                    startTime: "10:00",
                    endTime: "13:00",
                    location: "somewhere",
                  },
                ],
              }),
            ];
          }
          return [];
        }
      );

      const res = await service.registerForCourse(
        mockStudent.id,
        mockCourse.id
      );

      expect(res.success).toBeFalsy();
      expect(res.message).toContain("conflict");
    });

    it("should return error if no available seats", async () => {
      const mockStudent = createMockStudent();
      const mockCourse = createMockCourse({ availableSeats: 0 });

      mockDb.sql.mockResolvedValueOnce([mockStudent]);
      mockDb.sql.mockResolvedValueOnce([mockCourse]);

      const res = await service.registerForCourse(
        mockStudent.id,
        mockCourse.id
      );
      expect(res.success).toBeFalsy();
      expect(res.message).toContain("seats");
    });

    it("should return error if credit hours exceeded", async () => {
      const mockStudent = createMockStudent({ maxCreditHours: 1 });
      const heavyCourse = createMockCourse({ creditHours: 10 });

      mockDb.sql.mockResolvedValueOnce([mockStudent]);
      mockDb.sql.mockResolvedValueOnce([heavyCourse]);

      const res = await service.registerForCourse(
        mockStudent.id,
        heavyCourse.id
      );
      expect(res.success).toBeFalsy();
      expect(res.message).toContain("maximum");
    });

    it("should successfully register student when all conditions are met", async () => {
      const mockStudent = createMockStudent();
      const mockCourse = createMockCourse();

      mockDb.sql.mockResolvedValueOnce([mockStudent]);
      mockDb.sql.mockResolvedValueOnce([mockCourse]);

      const res = await service.registerForCourse(
        mockStudent.id,
        mockCourse.id
      );
      expect(res.success).toBeTruthy();
      expect(res.message).toBeDefined();
      expect(res.registeredCourse).toEqual(mockCourse);

      // maybe also add here virification of db updates, but I'm lazy ¯\_(ツ)_/¯
    });
  });

  describe("dropCourse", () => {
    it("should return error if student is not found", async () => {
      mockDb.sql.mockResolvedValueOnce([]); // no user found

      const res = await service.dropCourse("nonexistent", "1");
      expect(res.success).toBeFalsy();
      expect(res.message).toContain("not found");
    });

    it("should return error if course is not found", async () => {
      const mockStudent = createMockStudent();

      mockDb.sql.mockResolvedValueOnce([mockStudent]);
      mockDb.sql.mockResolvedValueOnce([]);

      const res = await service.dropCourse(mockStudent.id, "nonexistent");
      expect(res.success).toBeFalsy();
      expect(res.message).toContain("not found");
    });

    it("should return error if the student is not registered for the course", async () => {
      const mockStudent = createMockStudent();
      const mockCourse = createMockCourse();

      mockDb.sql.mockResolvedValueOnce([mockStudent]);
      mockDb.sql.mockResolvedValueOnce([mockCourse]);

      const res = await service.dropCourse(mockStudent.id, mockCourse.id);
      expect(res.success).toBeFalsy();
      expect(res.message).toContain("not registered");
    });

    it("should successfully drop course when all conditions are met", async () => {
      const mockCourse = createMockCourse();
      const mockStudent = createMockStudent({
        currentCourses: [mockCourse.id],
      });

      mockDb.sql.mockResolvedValueOnce([mockStudent]);
      mockDb.sql.mockResolvedValueOnce([mockCourse]);

      const res = await service.dropCourse(mockStudent.id, mockCourse.id);
      expect(res.success).toBeTruthy();
      expect(res.message).toBeDefined();
    });
  });
});
