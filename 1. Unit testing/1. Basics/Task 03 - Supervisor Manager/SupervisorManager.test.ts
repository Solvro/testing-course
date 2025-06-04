import { describe, it, expect, beforeEach } from "vitest";
import { SupervisorManager, type Supervisor } from "./SupervisorManager";

const superVisor1: Supervisor = {
  id: "1",
  name: "Jan",
  expertiseTopics: ["web", "machine learning"],
  rating: 2.5,
  currentLoad: 4,
  maxLoad: 5,
};

const superVisor2: Supervisor = {
  id: "2",
  name: "Paweł",
  expertiseTopics: ["frontend", "embeded", "microcontrollers"],
  rating: 4.0,
  currentLoad: 5,
  maxLoad: 5,
};

const superVisor3: Supervisor = {
  id: "3",
  name: "Agnieszka",
  expertiseTopics: ["mobile", "databases"],
  rating: 5.0,
  currentLoad: 3,
  maxLoad: 6,
};

describe("SupervisorManager", () => {
  let supervisorManager: SupervisorManager;

  beforeEach(() => {
    supervisorManager = new SupervisorManager();
  });

  describe("addSupervisor", () => {
    it("should add new superVisor if it doesn't exist already", () => {
      supervisorManager.addSupervisor(superVisor1);

      expect(supervisorManager.findSupervisors("web")).toHaveLength(1);
    });

    it("should throw error if superVisor already exists", () => {
      supervisorManager.addSupervisor(superVisor1);
      expect(() => {
        supervisorManager.addSupervisor(superVisor1);
      }).toThrow("Supervisor with id 1 already exists");
    });
  });

  describe("removeSupervisor", () => {
    it("should remove existing supervisor if it exists", () => {
      supervisorManager.addSupervisor(superVisor3);

      supervisorManager.removeSupervisor("3");
      expect(supervisorManager.findSupervisors("mobile")).toHaveLength(0);
    });

    it("should throw error while removing super visor if it doesn't exist", () => {
      expect(() => supervisorManager.removeSupervisor("3")).toThrow(
        "Supervisor with id 3 not found"
      );
    });
  });
});
