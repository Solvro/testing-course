import { Supervisor, SupervisorManager } from "./SupervisorManager";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";

const supervisors: Supervisor[] = [
  {
    id: "1",
    name: "Mariusz Pudzianowski",
    expertiseTopics: ["General Knowledge", "Patience"],
    currentLoad: 2,
    maxLoad: 5,
    rating: 4.5,
  },
  {
    id: "2",
    name: "Tuzin",
    expertiseTopics: ["Data warehouses"],
    currentLoad: 3,
    maxLoad: 3,
    rating: 4.0,
  },
];

const supervisorManager = new SupervisorManager();

describe("addSupervisor", () => {
  beforeEach(() => {
    supervisorManager.clearAll();
  });

  it("should add a new supervisor", () => {
    supervisorManager.addSupervisor(supervisors[0]);
    expect(supervisorManager.findSupervisors(supervisors[0].name)).toEqual([
      supervisors[0],
    ]);
  });

  it("should throw an error if supervisor with same id already exists", () => {
    supervisorManager.addSupervisor(supervisors[0]);
    expect(() => {
      supervisorManager.addSupervisor(supervisors[0]);
    }).toThrowError(/already exists/i);
  });
});

describe("deleteSupervisor", () => {
  beforeEach(() => {
    supervisorManager.clearAll();
  });

  it("should delete existing supervisor", () => {
    supervisorManager.addSupervisor(supervisors[0]);
    supervisorManager.removeSupervisor(supervisors[0].id);
    expect(supervisorManager.findSupervisors(supervisors[0].name)).toEqual([]);
  });

  it("should throw an error if supervisor is not found", () => {
    expect(() => {
      supervisorManager.removeSupervisor(supervisors[0].id);
    }).toThrowError(/not found/i);
  });
});

describe("updateSupervisor", () => {
  beforeEach(() => {
    supervisorManager.clearAll();
  });

  it("should update supervisor's name", () => {
    supervisorManager.addSupervisor(supervisors[0]);
    supervisorManager.updateSupervisor(supervisors[0].id, {
      name: supervisors[1].name,
    });
    expect(supervisorManager.findSupervisors("")).toMatchObject([
      {
        name: supervisors[1].name,
      },
    ]);
  });

  it("should update whole supervisor", () => {
    supervisorManager.addSupervisor(supervisors[0]);
    supervisorManager.updateSupervisor(supervisors[0].id, supervisors[1]);
    expect(
      supervisorManager.findSupervisors(supervisors[1].name, {
        includeFull: true,
      })
    ).toMatchObject([
      {
        name: supervisors[1].name,
      },
    ]);
  });

  it("should throw an error if supervisor is not found", () => {
    expect(() => {
      supervisorManager.updateSupervisor(supervisors[0].id, supervisors[1]);
    }).toThrowError(/not found/i);
  });
});

describe("findSupervisors", () => {
  beforeAll(() => {
    supervisors.forEach((supervisor) =>
      supervisorManager.addSupervisor(supervisor)
    );
  });

  it("should return supervisor with matching query", () => {
    expect(supervisorManager.findSupervisors(supervisors[0].name)).toHaveLength(
      1
    );
  });

  it("should hide full supervisors", () => {
    expect(supervisorManager.findSupervisors("")).toHaveLength(1);
  });

  it("shouldn't hide full supervisors", () => {
    expect(
      supervisorManager.findSupervisors("", { includeFull: true })
    ).toHaveLength(2);
  });
});
