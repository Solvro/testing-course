import { vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

class ResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
window.ResizeObserver = ResizeObserver;

Element.prototype.scrollIntoView = vi.fn();