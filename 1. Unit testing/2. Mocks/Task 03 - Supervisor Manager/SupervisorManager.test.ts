import { describe, it, expect, vi, beforeEach } from "vitest";
import { SupervisorManager, Supervisor } from "./SupervisorManager";
import { db } from "../utils/db";
vi.mock("../utils/db");
describe("SupervisorManager Constructor", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  it("Should allow creation with valid time", () => {
    vi.setSystemTime(new Date(2025, 5, 10, 4, 0, 0));
    expect(() => {
      new SupervisorManager();
    }).not.toThrow();
  });
  it("Should NOT  allow creation with valid time", () => {
    vi.setSystemTime(new Date(2025, 5, 10, 6, 0, 0));
    expect(() => {
      new SupervisorManager();
    }).toThrowError();
  });
});
describe("Add supervisior", () => {
  const testSupervisor: Supervisor = {
    id: "171",
    name: "Eve Nowicka",
    expertiseTopics: ["Gaming", "Hyper Gaming", "Hyper Inteligent Gaming"],
    rating: 4.5,
    currentLoad: 1,
    maxLoad: 5,
  };

  let sqlSpy: any;
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 5, 10, 4, 0, 0));
    sqlSpy = vi.spyOn(db, "sql");
  });
  it("Should allow adding a new supervisor", async () => {
    sqlSpy.mockResolvedValueOnce([]).mockResolvedValueOnce({});

    const manager = new SupervisorManager();
    await manager.addSupervisor(testSupervisor);
    expect(sqlSpy).toHaveBeenCalledTimes(2);
    expect(sqlSpy.mock.calls[1][1][0]).toBe("171");
  });
  it("Should throw an error if the same supervisor is added twice", async () => {
    sqlSpy.mockResolvedValueOnce([testSupervisor]);

    const manager = new SupervisorManager();

    await expect(manager.addSupervisor(testSupervisor)).rejects.toThrow(
      "Supervisor with id 171 already exists"
    );
  });
});
