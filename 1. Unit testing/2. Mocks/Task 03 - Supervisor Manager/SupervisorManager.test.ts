import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";
import { SupervisorManager, Supervisor } from "./SupervisorManager";
import { db } from "../utils/db";

vi.mock("../utils/db", () => ({
    db: {
        sql: vi.fn()
    }
}));

const alice: Supervisor = {
    id: "alice",
    name: "Alice Nowak",
    expertiseTopics: ["machine learning", "nlp"],
    rating: 4.8,
    currentLoad: 1,
    maxLoad: 3
};

const bob: Supervisor = {
    id: "bob",
    name: "Bob Kowalski",
    expertiseTopics: ["distributed systems", "databases"],
    rating: 4.9,
    currentLoad: 2,
    maxLoad: 2
};

const carol: Supervisor = {
    id: "carol",
    name: "Carol Żyła",
    expertiseTopics: ["nlp", "information retrieval"],
    rating: 4.5,
    currentLoad: 0,
    maxLoad: 2
};

describe("SupervisorManager.findSupervisors", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2025, 5, 10, 4, 0, 0));
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.clearAllMocks();
    });

    it("returns matched supervisors sorted according to rules", async () => {
        const mgr = new SupervisorManager();
        vi.spyOn(db, "sql").mockResolvedValueOnce([alice, bob, carol]);

        const res = await mgr.findSupervisors("NLP machine");

        expect(db.sql).toHaveBeenCalledWith("SELECT * FROM supervisors");
        expect(res.map((s) => s.id)).toEqual(["alice", "carol"]);
    });

    it("includes full supervisors when includeFull is true", async () => {
        const mgr = new SupervisorManager();
        vi.spyOn(db, "sql").mockResolvedValueOnce([alice, bob, carol]);

        const res = await mgr.findSupervisors("distributed", { includeFull: true });

        expect(res.some((s) => s.id === "bob")).toBe(true);
    });

    it("honors the maxResults limit", async () => {
        const mgr = new SupervisorManager();
        vi.spyOn(db, "sql").mockResolvedValueOnce([alice, bob, carol]);

        const res = await mgr.findSupervisors("nlp", { maxResults: 1 });

        expect(res.length).toBe(1);
        expect(["alice", "carol"]).toContain(res[0].id);
    });

    it("returns non-full supervisors when there are no matches", async () => {
        const mgr = new SupervisorManager();
        vi.spyOn(db, "sql").mockResolvedValueOnce([alice, bob, carol]);

        const res = await mgr.findSupervisors("quantum cryptography");

        expect(res.map((s) => s.id).sort()).toEqual(["alice", "carol"]);
    });
});
