import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PlansPage } from "./plans";
import userEvent from "@testing-library/user-event";
import { navigate } from "@/tests/mocks/functions";
import { Providers } from "@/components/providers";
import { mockIsAuthenticated } from "@/tests/helpers";

vi.mock("@/lib/mock-plans", async (importOriginal) => {
  const { mockPlans } = await importOriginal<
    typeof import("@/lib/mock-plans")
  >();
  return {
    mockPlans: [
      ...mockPlans,
      {
        id: 4,
        name: "Plan Dodatkowy",
        description: "Zajęcia zmyślone",
        isActive: false,
        isFavorite: false,
        totalCredits: 3,
        conflicts: 2,
        lastModified: "2025-06-25",
        classes: [
          {
            id: 15,
            courseName: "Algorytmy i struktury danych",
            courseCode: "Grupa 2",
            instructor: "Dariusz Konieczny",
            time: "08:00 - 09:30",
            day: "Poniedziałek",
            location: "Sala 311c",
            credits: 2,
            type: "Seminar",
          },
          {
            id: 16,
            courseName: "Systemy operacyjne",
            courseCode: "Grupa 4",
            instructor: "Arkadiusz Warzyński",
            time: "10:00 - 11:30",
            day: "Poniedziałek",
            location: "Sala 100",
            credits: 3,
            type: "UNKNOWN",
          },
        ],
      },
    ],
  };
});

const renderPlans = () => render(<PlansPage />, { wrapper: Providers });

describe("Plans page", () => {
  it("should navigate on log out", async () => {
    const user = userEvent.setup();
    const screen = renderPlans();
    const logOutButton = screen.getByRole("button", { name: "Wyloguj" });
    expect(logOutButton).toBeInTheDocument();

    await user.click(logOutButton);
    expect(navigate).toHaveBeenCalledWith("/");
  });

  it("should render if authenticated", () => {
    mockIsAuthenticated(true);
    expect(renderPlans).not.toThrow();
  });

  it("should throw when used outside of AuthProvider", () => {
    expect(() => render(<PlansPage />)).toThrow(
      "useAuth must be used within an AuthProvider",
    );
  });
});
