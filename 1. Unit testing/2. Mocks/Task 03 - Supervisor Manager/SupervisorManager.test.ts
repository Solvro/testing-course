import { describe, expect, it, vi } from "vitest";
import { db } from "../utils/db";
import { Supervisor, SupervisorManager } from "./SupervisorManager";
vi.mock("../utils/db.ts");

const mockedSupervisors: Supervisor[] = [
  {
    id: "123",
    name: "Bartosz",
    expertiseTopics: ["Elo", "zelo"],
    rating: 5.0,
    currentLoad: 10,
    maxLoad: 999999,
  },
];

describe("Supervisor", () => {
  it("Get all supervisors", async () => {
    vi.setSystemTime(new Date(2025, 5, 13, 4));
    vi.mocked(db.sql).mockResolvedValue(mockedSupervisors);
    const supervisor = new SupervisorManager();
    await supervisor.addSupervisor({
      id: "1234",
      name: "Bartosz",
      expertiseTopics: ["Elo", "zelo"],
      rating: 5.0,
      currentLoad: 10,
      maxLoad: 999999,
    });
    expect(db.sql).toHaveBeenCalledTimes(2);
  });
});
