import {
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type Mock,
} from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OtpStep } from "@/components/otp-step";
import { server } from "@/tests/mocks/server";
import { toast } from "sonner";
import { BASE_URL } from "@/api/base-url";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { http, HttpResponse } from "msw";

vi.mock("@/hooks/use-auth");
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

describe("OtpStep", () => {
  const loginMock = vi.fn();
  const navigateMock = vi.fn();

  beforeAll(() => {
    (useAuth as Mock).mockReturnValue({ login: loginMock });
    (useNavigate as Mock).mockReturnValue(navigateMock);
  });

  beforeEach(() => {
    loginMock.mockClear();
    navigateMock.mockClear();
    vi.spyOn(toast, "success").mockImplementation(() => "mocked");
    vi.spyOn(toast, "error").mockImplementation(() => "mocked");
  });

  it("waliduje długość i format kodu OTP", async () => {
    render(<OtpStep email="student@pwr.edu.pl" />);
    const user = userEvent.setup();
    const input = screen.getByLabelText(/Hasło jednorazowe/i);
    const btn = screen.getByRole("button", { name: /Zaloguj się/i });

    await user.type(input, "abc");
    await user.click(btn);

    expect(
      await screen.findByText(/Kod OTP musi mieć 6 znaków/)
    ).toBeInTheDocument();
  });

  it("po wpisaniu prawidłowego kodu wywołuje login i nawigację", async () => {
    render(<OtpStep email="student@pwr.edu.pl" />);
    const user = userEvent.setup();
    const input = screen.getByLabelText(/Hasło jednorazowe/i);
    const btn = screen.getByRole("button", { name: /Zaloguj się/i });

    await user.type(input, "123456");
    await user.click(btn);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Zalogowano pomyślnie");
      expect(loginMock).toHaveBeenCalledWith("student@pwr.edu.pl");
      expect(navigateMock).toHaveBeenCalledWith("/plans");
    });
  });

  it("gdy serwer zwraca 400, pokazuje toast.error z message", async () => {
    server.use(
      http.post(`${BASE_URL}/user/otp/verify`, () => {
        return HttpResponse.json(
          { message: "Kod OTP jest nieprawidłowy" },
          { status: 400 }
        );
      })
    );

    render(<OtpStep email="student@pwr.edu.pl" />);
    const user = userEvent.setup();
    const input = screen.getByLabelText(/Hasło jednorazowe/i);
    const btn = screen.getByRole("button", { name: /Zaloguj się/i });

    await user.type(input, "000000");
    await user.click(btn);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Kod OTP jest nieprawidłowy");
      expect(loginMock).not.toHaveBeenCalled();
    });
  });
});
