import { vi, describe, expect, it, Mock, afterEach, beforeAll, beforeEach } from "vitest";
import { Supervisor, SupervisorManager } from "./SupervisorManager";
import { db } from "../utils/db";

// vi.mock("./SupervisorManager");
vi.mock("../utils/db");

const supervisor: Supervisor = {
  id: "miecz",
  name: "mieczyslaw",
  rating: 4,
  currentLoad: 5,
  maxLoad: 8,
  expertiseTopics: ["analiza matematyczna", "matematyka dyskretna"],
};

describe("supervisor manager", () => {
  const mockedHour = "2025-01-01 4:00"

  beforeEach(() => {
    vi.setSystemTime(mockedHour)
  })

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("constructor date outside hours", () => {
    vi.setSystemTime("2025-01-01 10:00");
    
    expect(() => new SupervisorManager()).toThrow(
      "Supervisors are only available between 3:00 AM and 5:00 AM"
    );
  });

  it("add supervisor already exists", async () => {
    const mockedSupervisors: Supervisor[] = [supervisor];

    vi.mocked(db.sql).mockResolvedValueOnce(mockedSupervisors);

    const supervisorManager = new SupervisorManager();

    await expect(supervisorManager.addSupervisor(supervisor)).rejects.toThrowError(`Supervisor with id ${supervisor.id} already exists`)
  });

  it("add supervisor success", async () => {
    const mockedSupervisors: Supervisor[] = [];

    const dbSpy = vi.spyOn(db, 'sql')

    vi.mocked(db.sql).mockResolvedValueOnce(mockedSupervisors);

    const supervisorManager = new SupervisorManager();

    await supervisorManager.addSupervisor(supervisor)

    expect(dbSpy.mock.calls.find((call) => call[0].includes("INSERT"))?.length).toBeGreaterThan(0)
  });
});
