import {vi,  describe, it, expect, beforeEach} from 'vitest';
import {ExamConflicts, ExamRaw} from './ExamConflicts';
import {db} from '../utils/db'; 

vi.mock('../utils/db');

const mockExam: ExamRaw = {
    id: 1,
    subject: 'Testing',
    date: '2137-07-07',
    durationMinutes: 90,
    location: 'Remote',
    fee: 100,
    earlyBirdDeadline: '2137-07-02',
    registrationDeadline: '2137-07-04'
}

describe('constructor', () => {
    it('should throw an error if it is not July', () => {
        vi.setSystemTime(new Date('2023-06-01')); 
        expect(() => new ExamConflicts()).toThrowError(/managed in July/i);
    })
    it("should create exam if it is July", () => {
        vi.setSystemTime(new Date('2023-07-01'));
        const exams = new ExamConflicts();
        expect(exams).toBeInstanceOf(ExamConflicts);
    }
);
});

describe('getExamById', () => {
    let exams: ExamConflicts;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.setSystemTime(new Date('2023-07-01')); 
        exams = new ExamConflicts();
    });

    it('should throw error if an exam was not found ', async () => {
        vi.mocked(db.sql).mockResolvedValue([]);
        await expect(exams.getExamById(1)).rejects.toThrowError(/not found/i);
    })

    it("should return exam with given ID", async () => {
        vi.mocked(db.sql).mockResolvedValue([mockExam]);
        const exam = await exams.getExamById(1);
        expect(exam).toMatchObject({id: 1})
    })
})

describe("get AllExams", () => {
    let exams: ExamConflicts;
    beforeEach(() => {
        vi.clearAllMocks();
        vi.setSystemTime(new Date('2023-07-01')); 
        exams = new ExamConflicts();
    });

    it("should return empty array if no exams are found", async () => {
        vi.mocked(db.sql).mockResolvedValue([]);
        const allExams = await exams.getAllExams();
        expect(allExams).toEqual([]);
    });

    it("should return all exams", async() => {
        vi.mocked(db.sql).mockResolvedValue([mockExam, {...mockExam, id: 2}]);
        const allExams = await exams.getAllExams();
        expect(allExams).toHaveLength(2);
        expect(allExams[0]).toMatchObject({id: 1});
        expect(allExams[1]).toMatchObject({id: 2});
    })

})

describe("computeRegistrationFee", () => {
    let exams: ExamConflicts;
    beforeEach(() => {
        vi.clearAllMocks();
        exams = new ExamConflicts();
    });

    it("should lower fee by 20% if before earlyBirdDeadline", async () => {
        vi.setSystemTime(new Date('2137-07-01'));
        vi.mocked(db.sql).mockResolvedValue([mockExam]);
        const fee = await exams.computeRegistrationFee(1);
        expect(fee).equal(mockExam.fee * 0.8);
    });

    it("should return full fee if before registrationDeadline", async () => {
        vi.setSystemTime(new Date('2137-07-04'));
        vi.mocked(db.sql).mockResolvedValue([mockExam]);
        const fee = await exams.computeRegistrationFee(1);
        expect(fee).equal(mockExam.fee);
    });

    it("should return registration closed error after registration deadline", async () => {
        vi.setSystemTime(new Date('2137-07-06'));
        vi.mocked(db.sql).mockResolvedValue([mockExam]);
        expect(() => exams.computeRegistrationFee(1)).rejects.toThrowError(/closed/i);
    });


});