import {describe, it, expect } from "vitest";
import { parseExamSchedule } from "./examConflicts";

describe('parseExamSchedule', () => {
    it('should throw an error for invalid JSON', ()=>{
        const invalidJSON = "moj zegar biologiczny jest jebanym uosobieniem sinusoidy";
        expect(() => parseExamSchedule(invalidJSON)).toThrow("Invalid JSON");
    })

    it('should throw an error if parsed JSON is not an array', ()=>{
        const notArrayJSON = JSON.stringify({subject: "Plakanie po ciuchu"})
        expect(() => parseExamSchedule(notArrayJSON)).toThrow("Expected an array of exams");
    })

    it('should throw an error for missing or/and invalid fields', () => {
        const badFieldsJSON = JSON.stringify([
        {
                subject: "Lizanie piet prowadzacego",
                date: "1970-01-01T05:30:00Z",
                durationMinutes: 2000,
                location: "Piwnica",
                fee: "30000",
                earlyBirdDeadline: "1969-12-07T23:59:59Z",
                registrationDeadline: "1969-12-20T23:59:59Z",
        }
        ]);
        expect(() => parseExamSchedule(badFieldsJSON)).toThrow(/fee/); //regex bo jestem leniwy
    });

    it('should throw an error for invalid date formats', () => {
        const badDateJSON = JSON.stringify([
        {
            subject: "Lizanie piet prowadzacego",
            date: "dzien osadu",
            durationMinutes: 2000,
            location: "Piwnica",
            fee: 30000,
            earlyBirdDeadline: "1969-12-07T23:59:59Z",
            registrationDeadline: "1969-12-20T23:59:59Z",
        }
        ]);
    expect(() => parseExamSchedule(badDateJSON)).toThrow(/Invalid date format at index/);
  });


    it('should throw an error if early bird is after registration deadline', () => {
    const badDeadlineOrderJSON = JSON.stringify([
      {
        subject: "Lizanie piet prowadzacego",
        date: "2025-07-01T10:00:00Z",
        durationMinutes: 2000,
        location: "Piwnica",
        fee: 30000,
        earlyBirdDeadline: "2025-06-21T00:00:00Z",
        registrationDeadline: "2025-06-20T00:00:00Z"
      }
    ]);
    expect(() => parseExamSchedule(badDeadlineOrderJSON)).toThrow(/Early-bird deadline after registration deadline/);
  });

  it('should throw an error if registration deadline is after exam date', () => {
    const badDeadlineOrderJSON = JSON.stringify([
      {
        subject: "Lizanie piet prowadzacego",
        date: "2025-06-25T10:00:00Z",
        durationMinutes: 2000,
        location: "Piwnica",
        fee: 30000,
        earlyBirdDeadline: "2025-06-01T00:00:00Z",
        registrationDeadline: "2025-06-30T00:00:00Z"
      }
    ]);
    expect(() => parseExamSchedule(badDeadlineOrderJSON)).toThrow(/Registration deadline after exam date/);
  });

  it('should successfully parse a valid exam schedule', () => {
    const validJSON = JSON.stringify([
      {
        subject: "Lizanie piet prowadzacego",
        date: "1970-01-01T05:30:00Z",
        durationMinutes: 2000,
        location: "Piwnica",
        fee: 30000,
        earlyBirdDeadline: "1969-12-07T23:59:59Z",
        registrationDeadline: "1969-12-20T23:59:59Z",
      }
    ]);

    const result = parseExamSchedule(validJSON);
    expect(result).toHaveLength(1);
    expect(result[0].subject).toBe("Lizanie piet prowadzacego");
    expect(result[0].date).toBeInstanceOf(Date);
    expect(result[0].durationMinutes).toBe(2000);
    expect(result[0].location).toBe("Piwnica");
    expect(result[0].fee).toBe(30000);
    expect(result[0].earlyBirdDeadline).toBeInstanceOf(Date);
    expect(result[0].registrationDeadline).toBeInstanceOf(Date);
  });
})