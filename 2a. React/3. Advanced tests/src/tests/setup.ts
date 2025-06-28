import { afterAll, afterEach, beforeAll, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import ResizeObserver from "resize-observer-polyfill";
import { server } from "./mocks/server";
import type { PropsWithChildren } from "react";
import { mockNavigate, mockNavigateTo } from "./mocks/functions";

vi.mock('@/hooks/use-auth', () => {
  return {
    useAuth: vi.fn().mockReturnValue({
      isAuthenticated: false,
    }),
    AuthProvider: ( {children}: PropsWithChildren) => { children } 
  }
});

vi.mock("react-router", async (importOriginal) => {
  return {
    ...( await importOriginal<typeof import("react-router")>()),
    Navigate: mockNavigate,
    useNavigate: mockNavigateTo,
  };
});

beforeAll(
  () => {
    server.listen();
    if (!document.elementFromPoint) {
      document.elementFromPoint = () => document.body; // mock for otp
    }
  }
);
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
