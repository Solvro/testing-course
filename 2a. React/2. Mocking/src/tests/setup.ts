import { beforeAll, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import ResizeObserver from "resize-observer-polyfill";
import { server } from "./server";

beforeAll(() => {
    server.listen();
});

beforeAll(() => {
    server.resetHandlers();
});

beforeAll(() => {
    server.close();
});

global.ResizeObserver = ResizeObserver;

Element.prototype.scrollIntoView = vi.fn();
