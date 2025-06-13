import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SupervisorManager, Supervisor } from "./SupervisorManager";
import { db } from "../utils/db";

const mockDate = vi.fn();
vi.stubGlobal("Date", mockDate);

vi.mock("../utils/db", () => ({
  db: {
    sql: vi.fn(),
  },
}));

const mockDb = vi.mocked(db);

describe("SupervisorManager", () => {
  let manager: SupervisorManager;
  let mockSupervisors: Supervisor[];

  beforeEach(() => {
    vi.clearAllMocks();

    mockSupervisors = [
      {
        id: "1",
        name: "Dr. Alice Johnson",
        expertiseTopics: ["machine learning", "data science"],
        rating: 4.5,
        currentLoad: 2,
        maxLoad: 5,
      },
      {
        id: "2",
        name: "Prof. Bob Smith",
        expertiseTopics: ["nlp", "artificial intelligence"],
        rating: 4.8,
        currentLoad: 3,
        maxLoad: 3,
      },
      {
        id: "3",
        name: "Dr. Carol Williams",
        expertiseTopics: ["computer vision", "deep learning"],
        rating: 4.2,
        currentLoad: 1,
        maxLoad: 4,
      },
    ];

    mockDb.sql.mockResolvedValue(mockSupervisors);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("constructor", () => {
    it("should create instance when time is within allowed hours (3-5 AM)", () => {
      const validDate = {
        getHours: () => 4,
        getMinutes: () => 30,
        getSeconds: () => 0,
      };
      mockDate.mockImplementationOnce(() => validDate);

      expect(() => new SupervisorManager()).not.toThrow();
    });

    it("should throw error when time is outside allowed hours", () => {
      const invalidDate = {
        getHours: () => 10,
        getMinutes: () => 0,
        getSeconds: () => 0,
      };
      mockDate.mockImplementationOnce(() => invalidDate);

      expect(() => new SupervisorManager()).toThrow(
        "Supervisors are only available between 3:00 AM and 5:00 AM"
      );
    });

    it("should throw error at exactly 5:00:01 AM", () => {
      const edgeDate = {
        getHours: () => 5,
        getMinutes: () => 0,
        getSeconds: () => 1,
      };
      mockDate.mockImplementationOnce(() => edgeDate);

      expect(() => new SupervisorManager()).toThrow(
        "Supervisors are only available between 3:00 AM and 5:00 AM"
      );
    });

    it("should work at exactly 3:00:00 AM", () => {
      const edgeDate = {
        getHours: () => 3,
        getMinutes: () => 0,
        getSeconds: () => 0,
      };
      mockDate.mockImplementationOnce(() => edgeDate);

      expect(() => new SupervisorManager()).not.toThrow();
    });

    it("should work at exactly 5:00:00 AM", () => {
      const edgeDate = {
        getHours: () => 5,
        getMinutes: () => 0,
        getSeconds: () => 0,
      };
      mockDate.mockImplementationOnce(() => edgeDate);

      expect(() => new SupervisorManager()).not.toThrow();
    });
  });

  describe("addSupervisor", () => {
    beforeEach(() => {
      const validDate = {
        getHours: () => 4,
        getMinutes: () => 0,
        getSeconds: () => 0,
      };
      mockDate.mockImplementation(() => validDate);
      manager = new SupervisorManager();
    });

    it("should add a new supervisor successfully", async () => {
      const newSupervisor: Supervisor = {
        id: "4",
        name: "Dr. Dave Brown",
        expertiseTopics: ["robotics"],
        rating: 4.0,
        currentLoad: 0,
        maxLoad: 3,
      };

      // Mock that supervisor doesn't exist
      mockDb.sql.mockResolvedValueOnce(mockSupervisors);
      // Mock successful insert
      mockDb.sql.mockResolvedValueOnce([]);

      await manager.addSupervisor(newSupervisor);

      expect(mockDb.sql).toHaveBeenCalledWith(
        "INSERT INTO supervisors (id, name, expertiseTopics, rating, currentLoad, maxLoad) VALUES ($1, $2, $3, $4, $5, $6)",
        ["4", "Dr. Dave Brown", ["robotics"], 4.0, 0, 3]
      );
    });

    it("should throw error when supervisor with same id already exists", async () => {
      const duplicateSupervisor: Supervisor = {
        id: "1", // Same as existing supervisor
        name: "Dr. Duplicate",
        expertiseTopics: ["test"],
        rating: 3.0,
        currentLoad: 0,
        maxLoad: 2,
      };

      await expect(manager.addSupervisor(duplicateSupervisor)).rejects.toThrow(
        "Supervisor with id 1 already exists"
      );
    });
  });

  describe("removeSupervisor", () => {
    beforeEach(() => {
      const validDate = {
        getHours: () => 4,
        getMinutes: () => 0,
        getSeconds: () => 0,
      };
      mockDate.mockImplementation(() => validDate);
      manager = new SupervisorManager();
    });

    it("should remove supervisor successfully", async () => {
      mockDb.sql.mockResolvedValueOnce({ rowCount: 1 } as any);

      await manager.removeSupervisor("1");

      expect(mockDb.sql).toHaveBeenCalledWith(
        "DELETE FROM supervisors WHERE id = $1",
        ["1"]
      );
    });

    it("should throw error when supervisor not found", async () => {
      mockDb.sql.mockResolvedValueOnce({ rowCount: 0 } as any);

      await expect(manager.removeSupervisor("999")).rejects.toThrow(
        "Supervisor with id 999 not found"
      );
    });
  });

  describe("updateSupervisor", () => {
    beforeEach(() => {
      const validDate = {
        getHours: () => 4,
        getMinutes: () => 0,
        getSeconds: () => 0,
      };
      mockDate.mockImplementation(() => validDate);
      manager = new SupervisorManager();
    });

    it("should update supervisor successfully", async () => {
      const updates = { rating: 5.0, currentLoad: 3 };
      mockDb.sql.mockResolvedValueOnce(mockSupervisors);
      mockDb.sql.mockResolvedValueOnce([]);

      await manager.updateSupervisor("1", updates);

      expect(mockDb.sql).toHaveBeenCalledWith(
        "UPDATE supervisors SET rating = $2, currentLoad = $3 WHERE id = $1",
        ["1", 5.0, 3]
      );
    });

    it("should throw error when supervisor not found", async () => {
      mockDb.sql.mockResolvedValueOnce([]);

      await expect(
        manager.updateSupervisor("999", { rating: 5.0 })
      ).rejects.toThrow("Supervisor with id 999 not found");
    });

    it("should do nothing when no updates provided", async () => {
      await manager.updateSupervisor("1", {});

      // Should only call getAllSupervisors, not the update query
      expect(mockDb.sql).toHaveBeenCalledTimes(1);
    });
  });

  describe("findSupervisors", () => {
    beforeEach(() => {
      const validDate = {
        getHours: () => 4,
        getMinutes: () => 0,
        getSeconds: () => 0,
      };
      mockDate.mockImplementation(() => validDate);
      manager = new SupervisorManager();
    });

    it("should find supervisors by expertise topic", async () => {
      const results = await manager.findSupervisors("machine learning");

      // Should return Dr. Alice Johnson (has match) and also Dr. Carol Williams (has available slots)
      expect(results.length).toBeGreaterThan(0);
      const aliceResult = results.find((r) => r.name === "Dr. Alice Johnson");
      expect(aliceResult).toBeDefined();
    });

    it("should find supervisors by multiple topics", async () => {
      const results = await manager.findSupervisors("machine learning nlp");

      // Should find those with matches and those with available slots
      expect(results.length).toBeGreaterThan(0);
      const alice = results.find((r) => r.name === "Dr. Alice Johnson");
      const bob = results.find((r) => r.name === "Prof. Bob Smith");
      expect(alice).toBeDefined();
      expect(bob).toBeDefined();
    });

    it("should exclude full supervisors when they have no matches", async () => {
      // Make all supervisors full (currentLoad = maxLoad)
      const modifiedSupervisors = mockSupervisors.map((s) => ({
        ...s,
        currentLoad: s.maxLoad,
      }));
      mockDb.sql.mockResolvedValueOnce(modifiedSupervisors);

      const results = await manager.findSupervisors("quantum physics");

      // Since no one has "quantum physics" expertise and all are full, should be empty
      expect(results).toHaveLength(0);
    });

    it("should include full supervisors when they have matches", async () => {
      const results = await manager.findSupervisors("artificial intelligence");

      // Prof. Bob Smith is at max load but has expertise match
      expect(results.length).toBeGreaterThan(0);
      const bob = results.find((r) => r.name === "Prof. Bob Smith");
      expect(bob).toBeDefined();
    });

    it("should include full supervisors when includeFull is true", async () => {
      const results = await manager.findSupervisors("quantum physics", {
        includeFull: true,
      });

      // Should return all supervisors regardless of load or matches
      expect(results).toHaveLength(3);
    });

    it("should limit results when maxResults is specified", async () => {
      const results = await manager.findSupervisors("learning", {
        maxResults: 1,
      });

      expect(results).toHaveLength(1);
    });

    it("should sort by match count, then rating, then name", async () => {
      // Add another supervisor with same expertise but different rating
      const additionalSupervisor = {
        id: "4",
        name: "Dr. Adam Wilson",
        expertiseTopics: ["machine learning"],
        rating: 4.7,
        currentLoad: 1,
        maxLoad: 3,
      };

      mockDb.sql.mockResolvedValueOnce([
        ...mockSupervisors,
        additionalSupervisor,
      ]);

      const results = await manager.findSupervisors("machine learning");

      // Should return supervisors with matches plus those with available slots
      expect(results.length).toBeGreaterThanOrEqual(2);

      // Find supervisors with machine learning expertise
      const adamResult = results.find((r) => r.name === "Dr. Adam Wilson");
      const aliceResult = results.find((r) => r.name === "Dr. Alice Johnson");

      expect(adamResult).toBeDefined();
      expect(aliceResult).toBeDefined();

      // Check that Adam comes before Alice (higher rating)
      const adamIndex = results.indexOf(adamResult!);
      const aliceIndex = results.indexOf(aliceResult!);
      expect(adamIndex).toBeLessThan(aliceIndex);
    });

    it("should return supervisors with available slots even without matches", async () => {
      const results = await manager.findSupervisors("quantum physics");

      // Should return supervisors with available slots (Alice and Carol)
      expect(results.length).toBe(2);
      expect(results.find((r) => r.name === "Dr. Alice Johnson")).toBeDefined();
      expect(
        results.find((r) => r.name === "Dr. Carol Williams")
      ).toBeDefined();
    });

    it("should handle case insensitive search", async () => {
      const results = await manager.findSupervisors("MACHINE LEARNING");

      // Should find Dr. Alice Johnson who has the match
      const alice = results.find((r) => r.name === "Dr. Alice Johnson");
      expect(alice).toBeDefined();
    });
  });

  describe("tokenize", () => {
    it("should tokenize text correctly", () => {
      const result = SupervisorManager.tokenize("Machine Learning & AI");

      expect(result).toEqual(["machine", "learning", "ai"]);
    });

    it("should handle empty string", () => {
      const result = SupervisorManager.tokenize("");

      expect(result).toEqual([]);
    });

    it("should handle text with numbers and special characters", () => {
      const result = SupervisorManager.tokenize("AI-2024 & ML_basics");

      expect(result).toEqual(["ai", "2024", "ml", "basics"]);
    });
  });
});
