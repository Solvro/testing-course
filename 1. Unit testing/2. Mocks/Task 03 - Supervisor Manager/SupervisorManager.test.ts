import { beforeAll, describe, it } from "vitest";
import { vi, expect, beforeEach, afterEach } from "vitest";
import { Supervisor, SupervisorManager } from "./SupervisorManager";
import { db } from "../utils/db";

vi.mock("../utils/db");

let manager: SupervisorManager;

// i know it's overcomplicated for now, but maybe, i'll extend my PR in the future
const supervisorsMock: Supervisor[] = [
  {
    id: "1",
    name: "Alice",
    expertiseTopics: ["machine learning", "nlp"],
    rating: 4.5,
    currentLoad: 2,
    maxLoad: 5,
  },
  {
    id: "2",
    name: "Bob",
    expertiseTopics: ["data science", "statistics"],
    rating: 4.0,
    currentLoad: 3,
    maxLoad: 5,
  },
  {
    id: "3",
    name: "Charlie",
    expertiseTopics: ["computer vision", "deep learning"],
    rating: 5.0,
    currentLoad: 1,
    maxLoad: 5,
  },
];

describe("SupervisorManager", () => {
  describe("constructor", () => {
    it("should create instance during valid hours (3 AM)", () => {
      const mockDate = new Date(2025, 6, 8, 3, 0, 0);
      vi.setSystemTime(mockDate);

      expect(() => new SupervisorManager()).not.toThrow();
    });

    it("should create instance during valid hours (5:00 AM)", () => {
      const mockDate = new Date(2025, 6, 8, 5, 0, 0);
      vi.setSystemTime(mockDate);

      expect(() => new SupervisorManager()).not.toThrow();
    });

    it("should throw error outside valid hours (2:59 AM)", () => {
      const mockDate = new Date(2023, 0, 1, 2, 59, 0);
      vi.setSystemTime(mockDate);

      expect(() => new SupervisorManager()).toThrow(
        /between 3:00 AM and 5:00 AM/i,
      );
    });

    it("should throw error outside valid hours (5:01 AM)", () => {
      const mockDate = new Date(2023, 0, 1, 5, 1, 0);
      vi.setSystemTime(mockDate);

      expect(() => new SupervisorManager()).toThrow(
        /between 3:00 AM and 5:00 AM/i,
      );
    });
  });

  describe("CRUD", () => {
    beforeEach(() => {
      vi.setSystemTime(new Date(2025, 6, 8, 4, 0, 0));
      vi.mocked(db).sql = vi.fn();
      manager = new SupervisorManager();
    });

    describe("addSupervisor", () => {
      beforeEach(() => {
        vi.setSystemTime(new Date(2025, 6, 8, 4, 0, 0));
        vi.mocked(db).sql = vi.fn();
        manager = new SupervisorManager();
      });

      it("should add a new supervisor", async () => {
        vi.mocked(db.sql).mockResolvedValue([]);
        await expect(
          manager.addSupervisor(supervisorsMock[0]),
        ).resolves.toBeUndefined();
      });

      it("should throw error if supervisor with same id exists", async () => {
        vi.mocked(db.sql).mockResolvedValue(supervisorsMock);
        await expect(manager.addSupervisor(supervisorsMock[0])).rejects.toThrow(
          /already exists/i,
        );
      });
    });

    describe("removeSupervisor", () => {
      it("should remove an existing supervisor", async () => {
        vi.mocked(db.sql).mockResolvedValue({ rowCount: 1 } as any);
        await expect(manager.removeSupervisor("1")).resolves.toBeUndefined();
      });

      it("should throw error if supervisor not found", async () => {
        vi.mocked(db.sql).mockResolvedValue({ rowCount: 0 } as any);
        await expect(manager.removeSupervisor("42")).rejects.toThrow(
          /not found/i,
        );
      });
    });
  });
});
