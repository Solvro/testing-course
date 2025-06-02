import { db } from "../utils/db";

// Types
export interface Course {
  id: string;
  code: string;
  name: string;
  creditHours: number;
  availableSeats: number;
  prerequisites: string[]; // Course IDs that must be completed
  schedule: ClassSchedule[];
}

export interface ClassSchedule {
  day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";
  startTime: string; // Format: "HH:MM" in 24-hour format
  endTime: string; // Format: "HH:MM" in 24-hour format
  location: string;
}

export interface Student {
  id: string;
  name: string;
  completedCourses: string[]; // IDs of completed courses
  currentCourses: string[]; // IDs of currently registered courses
  maxCreditHours: number; // Maximum allowed credit hours per semester
}

export interface RegistrationResult {
  success: boolean;
  message: string;
  registeredCourse?: Course;
}

// Main service class for students to test
export class CourseRegistrationService {
  constructor() {
    const now = new Date();

    // NIE USUWAĆ TEGO - poradź sobie mockami :3
    if (now.getMonth() !== 1 && now.getMonth() !== 8) {
      throw new Error(
        "Registration is only available in February and September"
      );
    }
  }

  /**
   * Get a course by its ID
   */
  async getCourse(courseId: string): Promise<Course | undefined> {
    const rows = await db.sql("SELECT * FROM courses WHERE id = $1", [
      courseId,
    ]);
    return rows.length > 0 ? (rows[0] as Course) : undefined;
  }

  /**
   * Get a student by their ID
   */
  async getStudent(studentId: string): Promise<Student | undefined> {
    const rows = await db.sql("SELECT * FROM students WHERE id = $1", [
      studentId,
    ]);
    return rows.length > 0 ? (rows[0] as Student) : undefined;
  }

  /**
   * Register a student for a course
   */
  async registerForCourse(
    studentId: string,
    courseId: string
  ): Promise<RegistrationResult> {
    // Get student and course
    const student = await this.getStudent(studentId);
    if (!student) {
      return {
        success: false,
        message: `Student with ID ${studentId} not found`,
      };
    }

    const course = await this.getCourse(courseId);
    if (!course) {
      return {
        success: false,
        message: `Course with ID ${courseId} not found`,
      };
    }

    // Check if student is already registered for this course
    if (student.currentCourses.includes(courseId)) {
      return {
        success: false,
        message: `Student is already registered for ${course.code}`,
      };
    }

    // Check if prerequisites are met
    const missingPrerequisites = await this.checkPrerequisites(student, course);
    if (missingPrerequisites.length > 0) {
      const missingCourses = await Promise.all(
        missingPrerequisites.map(async (id) => {
          const prerequisiteCourse = await this.getCourse(id);
          return prerequisiteCourse?.code || id;
        })
      );

      return {
        success: false,
        message: `Missing prerequisites: ${missingCourses.join(", ")}`,
      };
    }

    // Check for schedule conflicts
    const hasConflict = await this.hasScheduleConflict(student, course);
    if (hasConflict) {
      return {
        success: false,
        message: `Schedule conflict detected with course ${course.code}`,
      };
    }

    // Check seat availability
    if (course.availableSeats <= 0) {
      return {
        success: false,
        message: `No available seats for course ${course.code}`,
      };
    }

    // Check credit hour limits
    const currentCreditHours = await this.calculateCurrentCreditHours(student);
    if (currentCreditHours + course.creditHours > student.maxCreditHours) {
      return {
        success: false,
        message: `Registering for this course would exceed the maximum of ${student.maxCreditHours} credit hours`,
      };
    }

    // All checks passed, register the student
    student.currentCourses.push(courseId);
    course.availableSeats--;

    // Update the database
    await db.sql("UPDATE students SET current_courses = $1 WHERE id = $2", [
      JSON.stringify(student.currentCourses),
      studentId,
    ]);
    await db.sql("UPDATE courses SET available_seats = $1 WHERE id = $2", [
      course.availableSeats,
      courseId,
    ]);

    return {
      success: true,
      message: `Successfully registered for ${course.code}`,
      registeredCourse: course,
    };
  }

  /**
   * Drop a course from a student's schedule
   */
  async dropCourse(
    studentId: string,
    courseId: string
  ): Promise<RegistrationResult> {
    // Get student and course
    const student = await this.getStudent(studentId);
    if (!student) {
      return {
        success: false,
        message: `Student with ID ${studentId} not found`,
      };
    }

    const course = await this.getCourse(courseId);
    if (!course) {
      return {
        success: false,
        message: `Course with ID ${courseId} not found`,
      };
    }

    // Check if student is registered for this course
    const courseIndex = student.currentCourses.indexOf(courseId);
    if (courseIndex === -1) {
      return {
        success: false,
        message: `Student is not registered for ${course.code}`,
      };
    }

    // Remove the course
    student.currentCourses.splice(courseIndex, 1);
    course.availableSeats++;

    // Update the database
    await db.sql("UPDATE students SET current_courses = $1 WHERE id = $2", [
      JSON.stringify(student.currentCourses),
      studentId,
    ]);
    await db.sql("UPDATE courses SET available_seats = $1 WHERE id = $2", [
      course.availableSeats,
      courseId,
    ]);

    return {
      success: true,
      message: `Successfully dropped ${course.code}`,
    };
  }

  /**
   * Check if a student has completed all prerequisites for a course
   * Returns IDs of missing prerequisites
   */
  private async checkPrerequisites(
    student: Student,
    course: Course
  ): Promise<string[]> {
    if (!course.prerequisites || course.prerequisites.length === 0) {
      return [];
    }

    return course.prerequisites.filter(
      (prerequisiteId) => !student.completedCourses.includes(prerequisiteId)
    );
  }

  /**
   * Check if a new course would create a schedule conflict
   */
  private async hasScheduleConflict(
    student: Student,
    newCourse: Course
  ): Promise<boolean> {
    // Get all currently registered courses
    const currentCourses = await Promise.all(
      student.currentCourses.map(async (id) => await this.getCourse(id))
    );
    const validCurrentCourses = currentCourses.filter(
      (course) => course !== undefined
    ) as Course[];

    // Check each day and time slot for conflicts
    for (const newSlot of newCourse.schedule) {
      for (const existingCourse of validCurrentCourses) {
        for (const existingSlot of existingCourse.schedule) {
          // Check if the days match
          if (newSlot.day === existingSlot.day) {
            // Check if times overlap
            if (
              this.timesOverlap(
                newSlot.startTime,
                newSlot.endTime,
                existingSlot.startTime,
                existingSlot.endTime
              )
            ) {
              return true;
            }
          }
        }
      }
    }

    return false;
  }

  /**
   * Check if two time ranges overlap
   */
  private timesOverlap(
    start1: string,
    end1: string,
    start2: string,
    end2: string
  ): boolean {
    // Convert times to minutes for easier comparison
    const start1Minutes = this.timeToMinutes(start1);
    const end1Minutes = this.timeToMinutes(end1);
    const start2Minutes = this.timeToMinutes(start2);
    const end2Minutes = this.timeToMinutes(end2);

    // Check for overlap
    return start1Minutes < end2Minutes && start2Minutes < end1Minutes;
  }

  /**
   * Convert time string (HH:MM) to minutes since midnight
   */
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Calculate current credit hours for a student
   */
  private async calculateCurrentCreditHours(student: Student): Promise<number> {
    let total = 0;
    for (const courseId of student.currentCourses) {
      const course = await this.getCourse(courseId);
      total += course?.creditHours || 0;
    }
    return total;
  }

  /**
   * Get all courses a student is eligible to register for
   */
  async getEligibleCourses(studentId: string): Promise<Course[]> {
    const student = await this.getStudent(studentId);
    if (!student) {
      return [];
    }

    // Get all courses from database
    const allCoursesRows = await db.sql("SELECT * FROM courses");
    const allCourses = allCoursesRows as Course[];

    // Filter all courses to find eligible ones
    const eligibleCourses: Course[] = [];

    for (const course of allCourses) {
      // Skip courses student is already taking
      if (student.currentCourses.includes(course.id)) {
        continue;
      }

      // Check prerequisites
      const missingPrereqs = await this.checkPrerequisites(student, course);
      if (missingPrereqs.length > 0) {
        continue;
      }

      // Check seat availability
      if (course.availableSeats <= 0) {
        continue;
      }

      // Check credit hour limit
      const currentCredits = await this.calculateCurrentCreditHours(student);
      if (currentCredits + course.creditHours > student.maxCreditHours) {
        continue;
      }

      // Course is eligible if it passes all checks
      eligibleCourses.push(course);
    }

    return eligibleCourses;
  }
}
