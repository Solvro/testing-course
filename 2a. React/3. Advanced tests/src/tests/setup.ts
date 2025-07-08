import { afterAll, afterEach, beforeAll, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import ResizeObserver from "resize-observer-polyfill";

import { server } from "./mocks/server";

vi.mock("@/hooks/use-auth", () => ({
  useAuth: vi.fn(),
}));

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

global.ResizeObserver = ResizeObserver;

Element.prototype.scrollIntoView = vi.fn();

Object.defineProperty(document, "elementFromPoint", {
  writable: true,
  value: vi.fn().mockReturnValue(null),
});

Object.defineProperty(document, "elementsFromPoint", {
  writable: true,
  value: vi.fn().mockReturnValue([]),
});

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
