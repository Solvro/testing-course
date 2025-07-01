import { useAuth } from '@/hooks/use-auth';
import type { RenderResult } from '@testing-library/react';
import { vi } from 'vitest';
import { MOCK_EMAIL } from './constants';

export function mockIsAuthenticated(isAuthenticated: boolean = false) {
  vi.mocked(useAuth).mockReturnValueOnce({
    isAuthenticated,
    user: isAuthenticated ? { email: MOCK_EMAIL.VALID } : null,
    login: vi.fn(),
    logout: vi.fn(),
  });
}

export function getLoginFormInputs(screen: RenderResult) {
  const emailInput = screen.getByLabelText('Adres e-mail');
  const submitButton = screen.getByRole('button');
  return { emailInput, submitButton };
}
