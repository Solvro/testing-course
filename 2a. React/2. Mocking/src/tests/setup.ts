import { vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import ResizeObserver from "resize-observer-polyfill";
import { server } from "@/mocks/server";
import { afterEach, beforeAll, afterAll } from "vitest";

global.ResizeObserver = ResizeObserver;

Element.prototype.scrollIntoView = vi.fn();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());