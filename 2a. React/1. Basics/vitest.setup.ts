import { vi } from "vitest";
import '@testing-library/jest-dom/vitest';

global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

Element.prototype.scrollIntoView = vi.fn();