import { afterAll, afterEach, beforeAll, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import ResizeObserver from "resize-observer-polyfill";
import { server } from "./mocks/server";

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

global.ResizeObserver = ResizeObserver;

window.HTMLElement.prototype.scrollIntoView = vi.fn()
window.HTMLElement.prototype.hasPointerCapture = vi.fn()
window.HTMLElement.prototype.releasePointerCapture = vi.fn()

Element.prototype.scrollIntoView = vi.fn();
