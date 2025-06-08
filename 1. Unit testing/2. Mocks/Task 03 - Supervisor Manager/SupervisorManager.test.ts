import { vi, it, expect, describe, beforeEach } from "vitest";

import { SupervisorManager, Supervisor } from "./SupervisorManager";
import { db } from "../utils/db";

vi.mock("../utils/db");

const supervisor: Supervisor = {
  id: "1",
  name: "Jane Doe",
  expertiseTopics: ["Python", "Django"],
  rating: 4.8,
  currentLoad: 1,
  maxLoad: 5,
};

beforeEach(() => {
  // Reset the mock before each test
  vi.clearAllMocks();
  // Set the system time to available hours for tests
  vi.setSystemTime("1987-11-14 3:00");
});

describe("constructor", () => {
  it("should throw error if not in available hours", () => {
    // Before 3 AM
    vi.setSystemTime("1987-11-14 2:59");
    expect(() => new SupervisorManager()).toThrow(/only available/i);
    // After 5 AM
    vi.setSystemTime("1987-11-14 5:01");
    expect(() => new SupervisorManager()).toThrow(/only available/i);
  });

  it("should not throw error if in available hours", () => {
    // Between 3 AM and 5 AM
    expect(() => new SupervisorManager()).not.toThrow();
    vi.setSystemTime("1987-11-14 4:59");
    expect(() => new SupervisorManager()).not.toThrow();
  });
});

describe("addSupervisor", () => {
  it("should throw error when adding existing supervisor", async () => {
    const manager = new SupervisorManager();
    vi.mocked(db.sql).mockResolvedValue([supervisor]);
    expect(manager.addSupervisor(supervisor)).rejects.toThrow(
      /already exists/i
    );
  });

  it("should not throw error when adding new supervisor", async () => {
    const manager = new SupervisorManager();
    vi.mocked(db.sql).mockResolvedValue([]);
    await expect(manager.addSupervisor(supervisor)).resolves.toBeUndefined();
  });
});

describe("removeSupervisor", () => {
  it("should throw error when removing non-existing supervisor", async () => {
    const manager = new SupervisorManager();
    vi.mocked(db.sql).mockResolvedValue({ rowCount: 0 } as any);
    await expect(manager.removeSupervisor(supervisor.id)).rejects.toThrow(
      /not found/i
    );
  });

  it("should not throw error when removing existing supervisor", async () => {
    const manager = new SupervisorManager();
    vi.mocked(db.sql).mockResolvedValue({ rowCount: 1 } as any);
    await expect(
      manager.removeSupervisor(supervisor.id)
    ).resolves.toBeUndefined();
  });
});

describe("updateSupervisor", () => {
  it("should throw error when updating non-existing supervisor", async () => {
    const manager = new SupervisorManager();
    vi.mocked(db.sql).mockResolvedValue([]);
    await expect(
      manager.updateSupervisor("non-existing-id", { name: "" })
    ).rejects.toThrow(/not found/i);
  });

  it("should not throw error when updating existing supervisor", async () => {
    const manager = new SupervisorManager();
    vi.mocked(db.sql).mockResolvedValue([supervisor]);
    await expect(
      manager.updateSupervisor(supervisor.id, { name: "John Doe" })
    ).resolves.toBeUndefined();
  });
});
