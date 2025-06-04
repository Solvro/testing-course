import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
} from "vitest";
import { SupervisorManager } from "./SupervisorManager";

const supervisorManager = new SupervisorManager();

const supervisors = [
  {
    id: "1",
    name: "Alice",
    expertiseTopics: ["AI", "ML", "Backend"],
    currentLoad: 0,
    maxLoad: 5,
    rating: 4.5,
  },
  {
    id: "2",
    name: "Bob",
    expertiseTopics: ["Data Science", "AI"],
    currentLoad: 2,
    maxLoad: 5,
    rating: 4.0,
  },
  {
    id: "3",
    name: "Charlie",
    expertiseTopics: ["ML", "Deep Learning", "Frontend"],
    currentLoad: 5,
    maxLoad: 5,
    rating: 4.7,
  },
  {
    id: "4",
    name: "David",
    expertiseTopics: ["DevOps", "Cloud"],
    currentLoad: 1,
    maxLoad: 5,
    rating: 3.8,
  },
  {
    id: "5",
    name: "Eve",
    expertiseTopics: ["AI", "ML", "Backend", "Testing"],
    currentLoad: 8,
    maxLoad: 5,
    rating: 4.9,
  },
];

describe("addSupervisor", () => {
  afterEach(() => {
    supervisorManager.clearAll();
  });

  test("should add a new supervisor", () => {
    supervisorManager.addSupervisor(supervisors[0]);
    expect(
      supervisorManager.findSupervisors("", { includeFull: true }),
    ).toHaveLength(1);
  });

  test("new supervisor data should match", () => {
    supervisorManager.addSupervisor(supervisors[0]);
    const supervisor = supervisorManager.findSupervisors("", {
      includeFull: true,
    })[0];

    expect(supervisor.id).toEqual("1");
    expect(supervisor.name).toEqual("Alice");
    expect(supervisor.expertiseTopics).toEqual(["AI", "ML", "Backend"]);
    expect(supervisor.currentLoad).toEqual(0);
    expect(supervisor.maxLoad).toEqual(5);
    expect(supervisor.rating).toEqual(4.5);
  });

  test("should not add a supervisor with an existing ID", () => {
    supervisorManager.addSupervisor(supervisors[0]);

    expect(() => {
      supervisorManager.addSupervisor(supervisors[0]);
    }).toThrow(/already exists/i);
  });
});

describe("removeSupervisor", () => {
  afterEach(() => {
    supervisorManager.clearAll();
  });

  beforeEach(() => {
    supervisorManager.addSupervisor(supervisors[0]);
  });

  test("should remove supervisor", () => {
    supervisorManager.removeSupervisor(supervisors[0].id);
    expect(
      supervisorManager.findSupervisors("", { includeFull: true }),
    ).toHaveLength(0);
  });

  test("should throw error if no supervisor with ID", () => {
    expect(() => {
      supervisorManager.removeSupervisor(supervisors[1].id);
    }).toThrow(/not found/i);
  });
});

describe("updateSupervisor", () => {
  afterEach(() => {
    supervisorManager.clearAll();
  });

  beforeEach(() => {
    supervisorManager.addSupervisor(supervisors[0]);
  });

  test("should update existing supervisor", () => {
    const updates = { currentLoad: 2, rating: 4.8 };
    supervisorManager.updateSupervisor(supervisors[0].id, updates);

    const updatedSupervisor = supervisorManager.findSupervisors("", {
      includeFull: true,
    })[0];
    expect(updatedSupervisor.currentLoad).toEqual(2);
    expect(updatedSupervisor.rating).toEqual(4.8);
  });

  test("should not change other properies", () => {
    const updates = { currentLoad: 1 };
    supervisorManager.updateSupervisor(supervisors[0].id, updates);

    const updatedSupervisor = supervisorManager.findSupervisors("", {
      includeFull: true,
    })[0];
    expect(updatedSupervisor.currentLoad).toEqual(1);
    expect(updatedSupervisor.rating).toEqual(4.5); // rating should remain unchanged
  });

  test("should throw error if no supervisor with ID", () => {
    expect(() => {
      supervisorManager.updateSupervisor("non-existing-id", { currentLoad: 1 });
    }).toThrow(/not found/i);
  });
});

describe("findSupervisors", () => {
  beforeAll(() => {
    supervisors.forEach((sp) => supervisorManager.addSupervisor(sp));
  });

  afterAll(() => {
    supervisorManager.clearAll();
  });

  test("should respect maxResults option", () => {
    const result = supervisorManager.findSupervisors("", { maxResults: 1 });
    expect(result).toHaveLength(1);
  });

  test("should hide full supervisors by default", () => {
    const result = supervisorManager.findSupervisors("");
    expect(result).toHaveLength(3);
  });

  test("should include full supervisors if includeFull is true", () => {
    const result = supervisorManager.findSupervisors("", { includeFull: true });
    expect(result).toHaveLength(5);
  });

  test("should exclude full supervisors if includeFull is false", () => {
    const result = supervisorManager.findSupervisors("", {
      includeFull: false,
    });
    expect(result).toHaveLength(3);
    const expectedIds = ["1", "2", "4"];
    for (const supervisor of result) {
      expect(expectedIds).toContain(supervisor.id);
    }
  });

  test("should sort results by match count", () => {
    const result = supervisorManager.findSupervisors("AI Backend Testing", {
      maxResults: 3,
    });
    expect(result).toHaveLength(3);
    const expectedIds = ["5", "1", "2"];
    expect(result.map((sp) => sp.id)).toEqual(expectedIds);
  });

  test("should sort by rating if match count is equal", () => {
    const result = supervisorManager.findSupervisors("", { includeFull: true });
    const expectedIds = ["5", "3", "1", "2", "4"];
    expect(result).toHaveLength(5);
    expect(result.map((sp) => sp.id)).toEqual(expectedIds);
  });

  test("should sort by name if match count and rating are equal", () => {
    supervisorManager.updateSupervisor("5", { rating: 4.5 });
    const result = supervisorManager.findSupervisors("Backend", {
      maxResults: 2,
    });

    expect(result).toHaveLength(2);
    expect(result[0].id).toEqual("1");
    expect(result[1].id).toEqual("5");

    supervisorManager.updateSupervisor("1", { name: "Zorro" });
    const updatedResult = supervisorManager.findSupervisors("Backend", {
      maxResults: 2,
    });

    expect(updatedResult).toHaveLength(2);
    expect(updatedResult[0].id).toEqual("5");
    expect(updatedResult[1].id).toEqual("1");
  });
});

describe("clearAll", () => {
  test("should clear all supervisors", () => {
    supervisorManager.addSupervisor(supervisors[0]);
    supervisorManager.clearAll();
    expect(
      supervisorManager.findSupervisors("", { includeFull: true }),
    ).toHaveLength(0);
  });
});

describe("tokenize", () => {
  test("should split string into words", () => {
    const result = SupervisorManager.tokenize("AI, ML, Backend");
    const expected = ["ai", "ml", "backend"];
    for (const token of expected) {
      expect(result).toContain(token);
    }
  });

  test("should handle empty string", () => {
    const result = SupervisorManager.tokenize("");
    expect(result).toEqual([]);
  });
});
