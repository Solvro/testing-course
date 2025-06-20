// vitest.setup.ts
import { expect, vi } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";

expect.extend(matchers);

class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
vi.stubGlobal("ResizeObserver", ResizeObserver);

vi.stubGlobal("HTMLElement", class {
  scrollIntoView = vi.fn();
});