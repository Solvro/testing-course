import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import ResizeObserver from 'resize-observer-polyfill';
import {
  navigate,
  NavigateComponent,
  toastError,
  toastSuccess,
} from './mocks/functions';

import { server } from './mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

vi.mock('@/hooks/use-auth', async (importOriginal) => {
  const { useAuth } = await importOriginal<typeof import('@/hooks/use-auth')>();
  return { useAuth: vi.fn(useAuth) };
});

vi.mock('sonner', async (importOriginal) => {
  return {
    ...(await importOriginal<typeof import('sonner')>()),
    toast: {
      error: toastError,
      success: toastSuccess,
    },
  };
});

vi.mock('react-router', async (importOriginal) => {
  const module = await importOriginal<typeof import('react-router')>();
  return {
    ...module,
    Navigate: NavigateComponent,
    useNavigate: () => navigate,
  };
});

global.ResizeObserver = ResizeObserver;

Element.prototype.scrollIntoView = vi.fn();

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
