import {describe, expect, it, vi} from "vitest";
import {Supervisor, SupervisorManager} from "./SupervisorManager";

vi.mock('../utils/db', () => ({
    db: {
        sql: vi.fn()
    }
}));

vi.mock('./SupervisorManager', async (importOriginal) => {
    const original = await importOriginal();
    return {
        // @ts-ignore
        ...original,
        getAllSupervisors: vi.fn()
    }
});

const getAllSupervisorsMock = vi.spyOn(SupervisorManager.prototype as any, 'getAllSupervisors');

function setInvalidSystemTime() {
    vi.setSystemTime('2024-01-01 01:00:00');
}

function setValidSystemTime() {
    vi.setSystemTime('2024-01-01 04:00:00');
}

function generateSupervisor(topics: string[], rating?: number, isFull?: boolean) {
    return {
        id: '1',
        name: 'test',
        expertiseTopics: topics,
        rating: rating ?? 1,
        currentLoad: isFull ? 10 : 0,
        maxLoad: 10,
    } as Supervisor;
}

describe("SupervisorManager", () => {
    it("should fail if incorrect time", () => {
        setInvalidSystemTime();
        expect(() => new SupervisorManager()).toThrowError(
            new Error("Supervisors are only available between 3:00 AM and 5:00 AM")
        );
    });
    it("should not fail with correct time", () => {
        setValidSystemTime();
        expect(() => new SupervisorManager()).toBeDefined();
    });
})

describe("findSupervisors", () => {
    setValidSystemTime();
    let manager = new SupervisorManager();

    it("should return no supervisors if none present", async () => {
        getAllSupervisorsMock.mockResolvedValue([]);
        const result = await manager.findSupervisors("");
        expect(result).toStrictEqual([]);
    });

    it("should return no supervisors if all full", async () => {
        getAllSupervisorsMock.mockResolvedValue([generateSupervisor([], undefined, true)]);
        const result = await manager.findSupervisors("");
        expect(result).toStrictEqual([]);
    });

    it("should return supervisors if all full with full allowed", async () => {
        const supervisor = generateSupervisor([], undefined, true);
        getAllSupervisorsMock.mockResolvedValue([supervisor]);
        const result = await manager.findSupervisors("", {
            includeFull: true
        });
        expect(result).toStrictEqual([supervisor]);
    });

    it("should sort by matchCount correctly", async () => {
        const supervisorMatching = generateSupervisor(['test1', 'test2', 'test3'], undefined, false);
        const supervisorNotMatching = generateSupervisor(['test4', 'test5'], undefined, false);
        getAllSupervisorsMock.mockResolvedValue([supervisorNotMatching, supervisorMatching]);
        const result = await manager.findSupervisors("test1 test2 test4");
        expect(result).toStrictEqual([supervisorMatching, supervisorNotMatching]);
    });

    it("should sort by rating correctly", async () => {
        const supervisorWithLowerRating = generateSupervisor(['test1'], 1, false);
        const supervisorWithHigherRating = generateSupervisor(['test4'], 10, false);
        getAllSupervisorsMock.mockResolvedValue([supervisorWithLowerRating, supervisorWithHigherRating]);
        const result = await manager.findSupervisors("test1 test4");
        expect(result).toStrictEqual([supervisorWithHigherRating, supervisorWithLowerRating]);
    });


    it("should return positive matches even if full load", async () => {
        const supervisorMatchingAndFull = generateSupervisor(['test1'], undefined, true);
        const supervisorNotMatchingAndNotFull = generateSupervisor(['test4'], undefined, false);
        getAllSupervisorsMock.mockResolvedValue([supervisorNotMatchingAndNotFull, supervisorMatchingAndFull]);
        const result = await manager.findSupervisors("test1", {
            includeFull: false,
            maxResults: 1
        });
        expect(result).toStrictEqual([supervisorMatchingAndFull]);
    });
});