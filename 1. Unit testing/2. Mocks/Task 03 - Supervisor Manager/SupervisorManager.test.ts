import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { SupervisorManager } from "./SupervisorManager";

vi.mock("../utils/db", () => ({
  db: {
    sql: vi.fn(),
  },
}));

vi.mock("./SupervisorManager", async (importOriginal) => {
  const original = await importOriginal();
  return {
    // @ts-ignore
    ...original,
    getAllSupervisors: vi.fn(),
  };
});

const getAllSupervisorsMocks = vi.spyOn(
  SupervisorManager.prototype as any,
  "getAllSupervisors"
);

describe("basic tests for SupervisorManager", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-01 03:30:00"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should create SupervisorManager in the correct time", () => {
    expect(() => new SupervisorManager()).toBeDefined();
  });

  it("should throw error because of incorrect time", () => {
    vi.setSystemTime(new Date("2024-01-01 23:00:00"));
    expect(() => new SupervisorManager()).toThrowError(
      new Error("Supervisors are only available between 3:00 AM and 5:00 AM")
    );
  });

  it("should find SupervisorManager", async () => {
    const manager = new SupervisorManager();
    const testSupervisor = {
      id: "1",
      name: "Janek",
      expertiseTopics: ["web", "c++", "mobile", "machine learning"],
      rating: 5,
      currentLoad: 1,
      maxLoad: 10,
    };

    getAllSupervisorsMocks.mockResolvedValue([testSupervisor]);
    const result = await manager.findSupervisors("web");
    expect(result).toStrictEqual([testSupervisor]);
  });

  it("should split ENGLISH words", () => {
    const result = SupervisorManager.tokenize("Hello, my name is Volodymyr");
    expect(result).toStrictEqual(["hello", "my", "name", "is", "volodymyr"]);
  });
});
