import { SupervisorManager, type Supervisor } from "./SupervisorManager";
import { describe, test, it, expect } from "vitest";

const sampleSupervisor: Supervisor = {
  id: "1",
  name: "Alice",
  expertiseTopics: ["JavaScript", "React"],
  currentLoad: 0,
  maxLoad: 5,
  rating: 4.5,
};

describe("SupervisorManager", () => {
  it("should add a supervisor to empty list", () => {
    const manager = new SupervisorManager();
    manager.addSupervisor(sampleSupervisor);
    expect(manager.findSupervisors("Alice")).toHaveLength(1);
  });

  it("should throw error when adding supervisor with existing id", () => {
    const manager = new SupervisorManager();
    manager.addSupervisor(sampleSupervisor);
    expect(() => {
      manager.addSupervisor({
        id: "1",
        name: "Bob",
        expertiseTopics: ["Node.js"],
        currentLoad: 0,
        maxLoad: 5,
        rating: 4.0,
      });
    }).toThrow("Supervisor with id 1 already exists");
  });

  it("should remove a supervisor by id", () => {
    const manager = new SupervisorManager();
    manager.addSupervisor(sampleSupervisor);
    manager.removeSupervisor("1");
    expect(manager.findSupervisors("Alice")).toHaveLength(0);
  });

  it("should throw error when removing non-existent supervisor", () => {
    const manager = new SupervisorManager();
    expect(() => {
      manager.removeSupervisor("non-existent-id");
    }).toThrow("Supervisor with id non-existent-id not found");
  });

  it("should update an existing supervisor", () => {
    const manager = new SupervisorManager();
    manager.addSupervisor(sampleSupervisor);
    manager.updateSupervisor("1", { currentLoad: 2 });
    const updated = manager.findSupervisors("Alice");
    expect(updated).toHaveLength(1);
    expect(updated[0].currentLoad).toBe(2);
  });

  it("should throw error when updating non-existent supervisor", () => {
    const manager = new SupervisorManager();
    expect(() => {
      manager.updateSupervisor("non-existent-id", { currentLoad: 2 });
    }).toThrow("Supervisor with id non-existent-id not found");
  });

  it("should find supervisors by expertise topics", () => {
    const manager = new SupervisorManager();
    manager.addSupervisor(sampleSupervisor);
    const results = manager.findSupervisors("JavaScript");
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe("Alice");
  });
});
