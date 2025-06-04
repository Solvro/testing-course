import { beforeEach, describe, expect, it } from "vitest";
import { Supervisor, SupervisorManager } from "./SupervisorManager";

describe("SupervisorManager", () => {
  let manager: SupervisorManager;

  const supervisorA: Supervisor = {
    id: "a",
    name: "Alice",
    expertiseTopics: ["machine learning", "nlp"],
    rating: 4.5,
    currentLoad: 1,
    maxLoad: 3,
  };

  const supervisorB: Supervisor = {
    id: "b",
    name: "Bob",
    expertiseTopics: ["computer vision", "ml"],
    rating: 4.7,
    currentLoad: 3,
    maxLoad: 3,
  };

  const supervisorC: Supervisor = {
    id: "c",
    name: "Charlie",
    expertiseTopics: ["nlp", "ai"],
    rating: 4.5,
    currentLoad: 0,
    maxLoad: 1,
  };

  beforeEach(() => {
    manager = new SupervisorManager();
    manager.clearAll();
    manager.addSupervisor(supervisorA);
    manager.addSupervisor(supervisorB);
    manager.addSupervisor(supervisorC);
  });

  describe("addSupervisor", () => {
    it("should add a new supervisor", () => {
      const newSupervisor: Supervisor = {
        id: "d",
        name: "Dana",
        expertiseTopics: ["robotics"],
        rating: 4.0,
        currentLoad: 0,
        maxLoad: 2,
      };

      manager.addSupervisor(newSupervisor);

      expect(manager.findSupervisors("", { includeFull: true })).toContainEqual(
        newSupervisor
      );
    });

    it("should throw if adding duplicate supervisor ID", () => {
      expect(() => manager.addSupervisor(supervisorA)).toThrowError(
        `Supervisor with id ${supervisorA.id} already exists`
      );
    });
  });

  describe("removeSupervisor", () => {
    it("should remove a supervisor by ID", () => {
      manager.removeSupervisor(supervisorA.id);

      expect(
        manager
          .findSupervisors("", { includeFull: true })
          .find((s) => s.id === supervisorA.id)
      ).toBeUndefined();
    });

    it("should throw if removing nonexistent supervisor", () => {
      expect(() => manager.removeSupervisor("x")).toThrowError(
        "Supervisor with id x not found"
      );
    });
  });

  describe("updateSupervisor", () => {
    it("should update a supervisor fields", () => {
      const updatedCurrentLoad = 2;
      const updatedRating = 3.2;

      manager.updateSupervisor(supervisorA.id, {
        currentLoad: updatedCurrentLoad,
        rating: updatedRating,
      });

      const supervisors = manager.findSupervisors("", { includeFull: true });

      const updated = supervisors.find((s) => s.id === supervisorA.id);

      expect(updated.currentLoad).toBe(updatedCurrentLoad);

      expect(updated.rating).toBe(updatedRating);
    });

    it("should throw if updating nonexistent supervisor", () => {
      expect(() =>
        manager.updateSupervisor("x", { name: "Unknown" })
      ).toThrow();
    });
  });

  describe("findSupervisors", () => {
    it("should return all supervisors when query is empty", () => {
      const results = manager.findSupervisors("", { includeFull: true });
      expect(results.length).toBe(3);
    });

    it("should return supervisors sorted by matchCount > rating > name", () => {
      const results = manager.findSupervisors("nlp");
      expect(results[0].id).toBe(supervisorA.id);
      expect(results[1].id).toBe(supervisorC.id);
    });

    it("should respect maxResults option", () => {
      const results = manager.findSupervisors("nlp", { maxResults: 1 });
      expect(results.length).toBe(1);
    });

    it("should exclude full supervisors unless includeFull is true", () => {
      const results = manager.findSupervisors("quantum computing");

      expect(results.some((s) => s.id === supervisorB.id)).toBe(false);

      const resultsFull = manager.findSupervisors("quantum computing", {
        includeFull: true,
      });

      expect(resultsFull.some((s) => s.id === supervisorB.id)).toBe(true);
    });
  });

  describe("tokenize", () => {
    it("should tokenize text correctly", () => {
      const tokens = SupervisorManager.tokenize("AI_ML! 2023-ready");
      expect(tokens).toEqual(["ai", "ml", "2023", "ready"]);
    });
  });

  describe("clearAll", () => {
    it("should clear all supervisors", () => {
      manager.clearAll();
      expect(manager.findSupervisors("", { includeFull: true })).toEqual([]);
    });
  });
});
