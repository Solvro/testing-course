import { describe, expect, it, vi } from "vitest";
import { db } from "../utils/db";
import { Supervisor } from "./SupervisorManager";
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
    vi.setSystemTime(new Date(2025, 5, 13, 14));
    vi.mocked(db.sql).mockResolvedValue(mockedSupervisors);
    const result = await db.sql("elo zelo");
    expect(result).toBe(mockedSupervisors);
  });
});
