import {describe, it, expect, vi, beforeEach, beforeAll, afterAll} from "vitest";
import {Supervisor, SupervisorManager} from "./SupervisorManager";
import { db } from "../utils/db";

vi.mock("../utils/db", () => ({
    db: {
        sql: vi.fn()
    }
}));

beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-10T04:00:00.000Z"))
});

afterAll(() => {
    vi.useRealTimers();
});

describe("SupervisorManager.addSupervisor", () => {
    const losowySupervisor: Supervisor = {
        id: "sp1",
        name: "Andrzej",
        expertiseTopics: ["Inżynieria Systemów", "Snowflake"],
        rating: 3,
        currentLoad: 1,
        maxLoad: 3,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should add supervisor if id does not exist", async () => {
        (db.sql as any).mockResolvedValueOnce([]);
        (db.sql as any).mockResolvedValueOnce(undefined);

        const manager = new SupervisorManager();
        await manager.addSupervisor(losowySupervisor);

        expect(db.sql).toHaveBeenCalledWith(
          `INSERT INTO supervisors (id, name, expertiseTopics, rating, currentLoad, maxLoad) VALUES ('${losowySupervisor.id}', '${losowySupervisor.name}', ARRAY['${losowySupervisor.expertiseTopics.join("','")}'], ${losowySupervisor.rating}, ${losowySupervisor.currentLoad}, ${losowySupervisor.maxLoad})`
        );

    });

    it("should throw an error if supervisor with the id already exists", async () => {
        (db.sql as any).mockResolvedValueOnce([losowySupervisor])
        const manager = new SupervisorManager();
        await expect(manager.addSupervisor(losowySupervisor)).rejects.toThrow(
      `Supervisor with id ${losowySupervisor.id} already exists`
    );
    });
};
