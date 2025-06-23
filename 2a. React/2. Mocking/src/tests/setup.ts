import "@testing-library/jest-dom/vitest";
import ResizeObserver from "resize-observer-polyfill";
import { beforeAll, afterEach, afterAll, vi } from 'vitest'
import { server } from '../mocks/server'

global.ResizeObserver = ResizeObserver;

Element.prototype.scrollIntoView = vi.fn();
 
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())