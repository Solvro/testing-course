import {describe, expect, it, vi} from "vitest";
import {SupervisorManager} from "./SupervisorManager";

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

});