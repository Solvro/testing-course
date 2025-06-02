import { describe, it, expect } from 'vitest';
import { parseExamSchedule } from './examConflicts';

describe('parseExamSchedule', () => {
    const exam1 = {
            subject: 'Math',
            date: new Date('2023-10-01T10:00:00.000Z'),
            durationMinutes: 120,
            location: 'Room 101',
            fee: 100,
            earlyBirdDeadline: new Date('2023-09-01T00:00:00.000Z'),
            registrationDeadline: new Date('2023-09-30T23:59:59.000Z'),
        };
    const exam2 = {
            subject: 'History',
            date: new Date('2023-11-01T10:00:00.000Z'),
            durationMinutes: 120,
            location: 'Room 101',
            fee: 100,
            earlyBirdDeadline: new Date('2023-09-02T00:00:00.000Z'),
            registrationDeadline: new Date('2023-10-01T23:59:59.000Z'),
        };
    const earlyDateAfterRegExam = {
            subject: 'Science',
            date: new Date('2023-10-15T10:00:00.000Z'),
            durationMinutes: 90,
            location: 'Room 102',
            fee: 150,
            earlyBirdDeadline: new Date('2023-12-10T00:00:00.000Z'),
            registrationDeadline: new Date('2023-10-11T23:59:59.000Z'),
    }
    const regAfterExamExam = {
            subject: 'Physics',
            date: new Date('2023-10-20T10:00:00.000Z'),
            durationMinutes: 90,
            location: 'Room 103',
            fee: 150,
            earlyBirdDeadline: new Date('2023-10-15T00:00:00.000Z'),
            registrationDeadline: new Date('2023-10-21T23:59:59.000Z'),
    }

    const validExams = [exam1, exam2];

    const validJson = JSON.stringify(validExams);
    const invalidJson = validJson + 'xd beka';
    const nonArrayJson = JSON.stringify(exam1);

    it('should return list of exams if the json is valid', () => {
        expect(parseExamSchedule(validJson)).toEqual(expect.arrayContaining(validExams));
    });

    it('should return an empty array if the json is empty array', () => {
        expect(parseExamSchedule('[]')).toEqual([]);
    });

    it('should throw an error if the json is invalid', () => {
        expect(() => parseExamSchedule(invalidJson)).toThrow('Invalid JSON');
    });

    it('should throw an error if the json is not an array', () => {
        expect(() => parseExamSchedule(nonArrayJson)).toThrow('Expected an array of exams');
    });

    it('should throw an error if business rule for dates early-reg is violated', () => {
        expect(() => parseExamSchedule(JSON.stringify([earlyDateAfterRegExam]))).toThrow(/Early-bird deadline after registration deadline/i);
    });

    it('should throw an error if business rule for dates reg-exam is violated', () => {
        expect(() => parseExamSchedule(JSON.stringify([regAfterExamExam]))).toThrow(/Registration deadline after exam date/i);
    })

    it.each([
        {field: "subject", "json": JSON.stringify([{...exam1, subject: 123}]), "error": "missing/invalid fields: subject"},
        {field: "date", "json": JSON.stringify([{...exam1, date: 123}]), "error": "missing/invalid fields: date"},
        {field: "durationMinutes", "json": JSON.stringify([{...exam1, durationMinutes: "two hours"}]), "error": "missing/invalid fields: durationMinutes"},
        {field: "location", "json": JSON.stringify([{...exam1, location: 123}]), "error": "missing/invalid fields: location"},
        {field: "fee", "json": JSON.stringify([{...exam1, fee: "hundred"}]), "error": "missing/invalid fields: fee"},
        {field: "earlyBirdDeadline", "json": JSON.stringify([{...exam1, earlyBirdDeadline: 123}]), "error": "missing/invalid fields: earlyBirdDeadline"},
        {field: "registrationDeadline", "json": JSON.stringify([{...exam1, registrationDeadline: 123}]), "error": "missing/invalid fields: registrationDeadline"},
    ])("should return an error if a field is invalid/missing", ({field, json, error}) => {
        expect(() => parseExamSchedule(json)).toThrowError(error);
    });

    it.each([
        {field: "earlyBirdDeadline", "json": JSON.stringify([{...exam1, earlyBirdDeadline: '2023-10-02T'}]), "error": /invalid EarlyBirdDeadline/i},
        {field: "registrationDeadline", "json": JSON.stringify([{...exam1, registrationDeadline: '2023-10-02fT00:00:00.000Z'}]), "error": /invalid RegistrationDeadline/i},
        {field: "examDate", "json": JSON.stringify([{...exam1, date: '2023-09-30T00:xd00:00.000Z'}]), "error": /invalid date/i},
    ])("should throw an error if date is incorrect for $field", ({json, error}) => {
        expect(() => parseExamSchedule(json)).toThrowError(error);
    });
})