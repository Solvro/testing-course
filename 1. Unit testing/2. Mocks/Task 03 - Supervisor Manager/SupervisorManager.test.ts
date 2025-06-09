import { vi, describe, expect, it } from "vitest";
import { Supervisor, SupervisorManager } from "./SupervisorManager";
import { db } from "../utils/db";

vi.mock("./SupervisorManager");
vi.mock("../utils/db");

const supervisor: Supervisor = {
  id: "miecz",
  name: "mieczyslaw",
  rating: 4,
  currentLoad: 5,
  maxLoad: 8,
  expertiseTopics: ["analiza matematyczna", "matematyka dyskretna"],
};

describe("supervisor manager tests", () => {
  it("constructor date inside hours", () => {
    vi.setSystemTime("2025-01-01 04:00");

    expect(() => new SupervisorManager()).not.toThrowError(
      "Error: Supervisors are only available between 3:00 AM and 5:00 AM"
    );
  });

  it("mock db", async () => {
    vi.mocked(db.sql).mockResolvedValue([1, 2, 3])

    const values = await db.sql("niesamowite query")

    expect(values).toStrictEqual([1, 2, 3])
  })

  it("add supervisor", async () => {
    vi.setSystemTime("2025-01-01 04:00");

    const mockedSupervisors: Supervisor[] = [supervisor];

    const dbSpy = vi.spyOn(db, 'sql')
    
    vi.mocked(db.sql)
    .mockResolvedValue([{ success: true }])
    .mockResolvedValueOnce(mockedSupervisors)
    
    const supervisorManager = new SupervisorManager();
    
    const addSpy = vi.spyOn(supervisorManager, "addSupervisor")

    await supervisorManager.addSupervisor(supervisor);

    console.dir(dbSpy.mock.settledResults, { depth: Infinity, colors: true, numericSeparator: true, getter: true })

    // console.log(addSpy.mock.settledResults)
  });
});
