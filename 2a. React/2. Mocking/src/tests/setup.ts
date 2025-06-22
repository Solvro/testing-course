import { afterAll, beforeAll, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import ResizeObserver from "resize-observer-polyfill";
import { server } from "./mocks/server";
import { afterEach } from "node:test";

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

global.ResizeObserver = ResizeObserver;

Element.prototype.scrollIntoView = vi.fn();
