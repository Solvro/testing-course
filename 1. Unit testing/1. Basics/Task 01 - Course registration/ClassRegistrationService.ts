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
  private courses: Map<string, Course> = new Map();
  private students: Map<string, Student> = new Map();

  constructor(courses: Course[], students: Student[]) {
    // Initialize the service with available courses and students
    courses.forEach((course) => this.courses.set(course.id, course));
    students.forEach((student) => this.students.set(student.id, student));
  }

  /**
   * Get a course by its ID
   */
  getCourse(courseId: string): Course | undefined {
    return this.courses.get(courseId);
  }

  /**
   * Get a student by their ID
   */
  getStudent(studentId: string): Student | undefined {
    return this.students.get(studentId);
  }

  /**
   * Register a student for a course
   */
  registerForCourse(studentId: string, courseId: string): RegistrationResult {
    // Get student and course
    const student = this.students.get(studentId);
    if (!student) {
      return {
        success: false,
        message: `Student with ID ${studentId} not found`,
      };
    }

    const course = this.courses.get(courseId);
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
    const missingPrerequisites = this.checkPrerequisites(student, course);
    if (missingPrerequisites.length > 0) {
      const missingCourses = missingPrerequisites
        .map((id) => this.courses.get(id)?.code || id)
        .join(", ");

      return {
        success: false,
        message: `Missing prerequisites: ${missingCourses}`,
      };
    }

    // Check for schedule conflicts
    const hasConflict = this.hasScheduleConflict(student, course);
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
    const currentCreditHours = this.calculateCurrentCreditHours(student);
    if (currentCreditHours + course.creditHours > student.maxCreditHours) {
      return {
        success: false,
        message: `Registering for this course would exceed the maximum of ${student.maxCreditHours} credit hours`,
      };
    }

    // All checks passed, register the student
    student.currentCourses.push(courseId);
    course.availableSeats--;

    // Update the maps
    this.students.set(studentId, student);
    this.courses.set(courseId, course);

    return {
      success: true,
      message: `Successfully registered for ${course.code}`,
      registeredCourse: course,
    };
  }

  /**
   * Drop a course from a student's schedule
   */
  dropCourse(studentId: string, courseId: string): RegistrationResult {
    // Get student and course
    const student = this.students.get(studentId);
    if (!student) {
      return {
        success: false,
        message: `Student with ID ${studentId} not found`,
      };
    }

    const course = this.courses.get(courseId);
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

    // Update the maps
    this.students.set(studentId, student);
    this.courses.set(courseId, course);

    return {
      success: true,
      message: `Successfully dropped ${course.code}`,
    };
  }

  /**
   * Check if a student has completed all prerequisites for a course
   * Returns IDs of missing prerequisites
   */
  private checkPrerequisites(student: Student, course: Course): string[] {
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
  private hasScheduleConflict(student: Student, newCourse: Course): boolean {
    // Get all currently registered courses
    const currentCourses = student.currentCourses
      .map((id) => this.courses.get(id))
      .filter((course) => course !== undefined) as Course[];

    // Check each day and time slot for conflicts
    for (const newSlot of newCourse.schedule) {
      for (const existingCourse of currentCourses) {
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
  private calculateCurrentCreditHours(student: Student): number {
    return student.currentCourses.reduce((total, courseId) => {
      const course = this.courses.get(courseId);
      return total + (course?.creditHours || 0);
    }, 0);
  }

  /**
   * Get all courses a student is eligible to register for
   */
  getEligibleCourses(studentId: string): Course[] {
    const student = this.students.get(studentId);
    if (!student) {
      return [];
    }

    // Filter all courses to find eligible ones
    return Array.from(this.courses.values()).filter((course) => {
      // Skip courses student is already taking
      if (student.currentCourses.includes(course.id)) {
        return false;
      }

      // Check prerequisites
      const missingPrereqs = this.checkPrerequisites(student, course);
      if (missingPrereqs.length > 0) {
        return false;
      }

      // Check seat availability
      if (course.availableSeats <= 0) {
        return false;
      }

      // Check credit hour limit
      const currentCredits = this.calculateCurrentCreditHours(student);
      if (currentCredits + course.creditHours > student.maxCreditHours) {
        return false;
      }

      // Course is eligible if it passes all checks
      return true;
    });
  }
}
