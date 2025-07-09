import "@testing-library/jest-dom/vitest";
import ResizeObserver from "resize-observer-polyfill";
import { vi } from "vitest";

global.ResizeObserver = ResizeObserver;

Element.prototype.scrollIntoView = vi.fn();