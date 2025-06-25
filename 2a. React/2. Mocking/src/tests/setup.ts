import { beforeAll, afterAll, afterEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import ResizeObserver from "resize-observer-polyfill";
import { server } from "../components/mocks/server";

beforeAll(() => {
  server.listen();
});
afterEach(() => {
  server.resetHandlers();
});
afterAll(() => {
  server.close();
});
global.ResizeObserver = ResizeObserver;

Element.prototype.scrollIntoView = vi.fn();
