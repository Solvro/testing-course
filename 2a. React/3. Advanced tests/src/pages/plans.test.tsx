import { mockPlans } from "@/lib/mock-plans";
import { mockAuth, mockNavigate, navigateTo } from "@/tests/utils";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const setup = () => {
  const { logoutMock } = mockAuth(true);
  navigateTo("/plans");

  return { logoutMock };
};

describe("PlansPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render", () => {
    setup();

    expect(screen.getByText(/kocham planer/i)).toBeInTheDocument();
    expect(screen.getByText(/student\.pwr\.edu\.pl/i)).toBeInTheDocument();
    expect(screen.getByText(/wyloguj/i)).toBeInTheDocument();
  });

  it("should render all mock plans", () => {
    setup();

    mockPlans.forEach((plan) => {
      expect(screen.getByText(plan.name)).toBeInTheDocument();
      expect(screen.getByText(plan.description)).toBeInTheDocument();
    });
  });

  it("should display conflicts when they exist", () => {
    setup();

    const plansWithConflicts = mockPlans.filter((plan) => plan.conflicts > 0);
    plansWithConflicts.forEach((plan) => {
      expect(
        screen.getByText(
          `${plan.conflicts} konflikt${plan.conflicts > 1 ? "y" : ""}`
        )
      ).toBeInTheDocument();
    });
  });

  it("should call logout and navigate to home when logout button is clicked", async () => {
    const user = userEvent.setup();
    const { logoutMock } = setup();

    const logoutButton = screen.getByText(/wyloguj/i);
    await user.click(logoutButton);

    expect(logoutMock).toBeCalled();
    expect(mockNavigate).toBeCalledWith("/");
  });
});
