import { it, expect, describe } from 'vitest';
import { canRegister, Exam } from './examConflict';

describe('canRegister', () => {
    const exam: Exam = {
        subject: "Interfejsy HMI",
        date: new Date("2025-06-03T10:00:00Z"),
        durationMinutes: 90,
        location: "Sala 205, C1",
        fee: 100,
        earlyBirdDeadline: new Date("2025-05-24T23:59:59Z"),
        registrationDeadline: new Date("2025-06-01T23:59:59Z")
    };

    it('should not allow registration after the deadline', () => {
        const now = new Date("2025-06-02T21:37:00Z");
        expect(canRegister(exam, now)).toBeFalsy();
    });

    it('should allow registration between early bird and deadline', () => {
        const now = new Date("2025-05-27T12:00:00Z");
        expect(canRegister(exam, now)).toBeTruthy();
    });

    it('should allow registration before early bird deadline', () => {
        const now = new Date("2025-05-22T14:50:00Z");
        expect(canRegister(exam, now)).toBeTruthy();
    });
});
