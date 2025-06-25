import { vi } from "vitest";

import ResizeObserver from "resize-observer-polyfill";
global.ResizeObserver = ResizeObserver;

window.HTMLElement.prototype.scrollIntoView = vi.fn();
