import { afterAll, afterEach, beforeAll, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import ResizeObserver from "resize-observer-polyfill";
import { server } from "./server";
import { testQueryClient } from "@/components/query-client";

beforeAll(() => {
  server.listen();
});

afterEach(() => {
  server.resetHandlers();
  testQueryClient.clear();
});

afterAll(() => {
  server.close();
});

global.ResizeObserver = ResizeObserver;

Element.prototype.scrollIntoView = vi.fn();
