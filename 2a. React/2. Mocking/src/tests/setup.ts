import { vi, beforeAll, afterEach, afterAll } from "vitest";
import "@testing-library/jest-dom/vitest";
import { server } from '../mocks/server.js';
import ResizeObserver from "resize-observer-polyfill";

beforeAll(() => server.listen());

afterEach(() => server.resetHandlers());

afterAll(() => server.close());

global.ResizeObserver = ResizeObserver;

Element.prototype.scrollIntoView = vi.fn();
