import { afterAll, afterEach, beforeAll, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import ResizeObserver from "resize-observer-polyfill";
import { server } from "./mocks/server";
import type { PropsWithChildren } from "react";

Document.prototype.elementFromPoint = vi.fn();

vi.mock("@/hooks/use-auth", () => {
  return {
    useAuth: vi.fn().mockReturnValue({
      isAuthenticated: false,
    }),
    AuthProvider: ({ children }: PropsWithChildren) => children,
  };
});

vi.mock("react-router", async (importOriginal) => {
  const module = await importOriginal<typeof import("react-router")>();
  return {
    ...module,
    Navigate: vi.fn(() => null),
    useNavigate: () => vi.fn(),
  };
});

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

global.ResizeObserver = ResizeObserver;

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
