import { beforeAll, afterEach, afterAll, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import ResizeObserver from "resize-observer-polyfill";
import { server } from "./mocks/server";

global.ResizeObserver = ResizeObserver;

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

Element.prototype.scrollIntoView = vi.fn();
