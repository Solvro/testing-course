import { afterAll, afterEach, beforeAll, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import ResizeObserver from "resize-observer-polyfill";

import { useAuth } from "@/hooks/use-auth";

import { server } from "./mocks/server";

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

global.ResizeObserver = ResizeObserver;

Document.prototype.elementFromPoint = vi.fn();

Element.prototype.scrollIntoView = vi.fn();
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

vi.mock("@/hooks/use-auth", async (importOriginal) => {
  const { useAuth } = await importOriginal<typeof import("@/hooks/use-auth")>();
  return { useAuth: vi.fn(useAuth) };
});

vi.mock("react-router", async (importOriginal) => {
  const module = await importOriginal<typeof import("react-router")>();
  return {
    ...module,
    Navigate: vi.fn(),
    useNavigate: () => vi.fn(),
  };
});

type AuthState = {
  isAuthenticated: boolean;
  user: { email: string } | null;
};

export const mockAuthState = (authState: AuthState) => {
  vi.mocked(useAuth).mockReturnValue({
    ...authState,
    login: vi.fn(),
    logout: vi.fn(),
  });
};
