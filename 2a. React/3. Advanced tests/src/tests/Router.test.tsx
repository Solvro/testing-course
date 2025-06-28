
import { it, expect, describe } from 'vitest'
import { screen } from '@testing-library/react';
import { mockAuthState, navigateTo } from './utils';
import { mockNavigate } from './mocks/functions';

describe('Router', () => {

    it('should render a login page at /', () => {
        mockAuthState(false);
        navigateTo('/');
        expect(screen.getByText(/zaloguj/i)).toBeInTheDocument();
    });

    it('should redirect to login when accessing /plans as unauthenticated user', async () => {
        mockAuthState(false);
        navigateTo('/plans');
        expect(mockNavigate).toHaveBeenCalledWith({ to: "/", replace: true }, undefined);
    });

    it('should render a plans page at /plans', () => {
        mockAuthState(true);
        navigateTo('/plans');
        expect(screen.getByText(/kocham planer/i)).toBeInTheDocument();
    });

    it('should redirect to plans when accessing / as authenticated user', () => {
        mockAuthState(true);
        navigateTo('/');
        expect(mockNavigate).toHaveBeenCalledWith({ to: "/plans", replace: true }, undefined);
    });

});
