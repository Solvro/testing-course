import { afterAll, afterEach, beforeAll, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import ResizeObserver from "resize-observer-polyfill";

import { server } from "./mocks/server";

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

global.ResizeObserver = ResizeObserver;

Element.prototype.scrollIntoView = vi.fn();

// Mock document.elementFromPoint for InputOTP component
Object.defineProperty(document, "elementFromPoint", {
  writable: true,
  value: vi.fn(() => null),
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

// Suppress specific input-otp timer errors that occur after test environment teardown
const originalError = console.error;
console.error = (...args) => {
  const message = args[0]?.toString() ?? '';
  // Suppress the specific input-otp timer error that occurs after test teardown
  if (message.includes('input-otp') && message.includes('Timeout._onTimeout')) {
    return;
  }
  originalError(...args);
};

// Handle unhandled promise rejections that might occur from input-otp timers
process.on('unhandledRejection', (reason) => {
  const message = reason?.toString() ?? '';
  // Suppress input-otp related timer errors
  if (message.includes('window is not defined') || message.includes('input-otp')) {
    return;
  }
  // Re-throw other unhandled rejections
  throw reason;
});
