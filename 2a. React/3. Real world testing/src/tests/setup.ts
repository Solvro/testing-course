import { vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import ResizeObserver from "resize-observer-polyfill";

global.ResizeObserver = ResizeObserver;

Element.prototype.scrollIntoView = vi.fn();
