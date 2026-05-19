import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProtectedRoute, GuestRoute } from './Guards';

// Mock Navigate from react-router-dom
vi.mock('react-router-dom', () => ({
  Navigate: vi.fn(({ to }) => <div data-testid="navigate" data-to={to} />)
}));

// Mock useAuth context hook
const mockUseAuth = vi.fn();
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth()
}));

describe('Guards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ProtectedRoute', () => {
    it('redirects to /login when user is not logged in', () => {
      mockUseAuth.mockReturnValue({ isLoggedIn: false });

      render(
        <ProtectedRoute>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRoute>
      );

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      const nav = screen.getByTestId('navigate');
      expect(nav).toBeInTheDocument();
      expect(nav.getAttribute('data-to')).toBe('/login');
    });

    it('renders children when user is logged in', () => {
      mockUseAuth.mockReturnValue({ isLoggedIn: true });

      render(
        <ProtectedRoute>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRoute>
      );

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
    });
  });

  describe('GuestRoute', () => {
    it('redirects to /avisos when user is logged in', () => {
      mockUseAuth.mockReturnValue({ isLoggedIn: true });

      render(
        <GuestRoute>
          <div data-testid="guest-content">Guest Content</div>
        </GuestRoute>
      );

      expect(screen.queryByTestId('guest-content')).not.toBeInTheDocument();
      const nav = screen.getByTestId('navigate');
      expect(nav).toBeInTheDocument();
      expect(nav.getAttribute('data-to')).toBe('/avisos');
    });

    it('renders children when user is not logged in', () => {
      mockUseAuth.mockReturnValue({ isLoggedIn: false });

      render(
        <GuestRoute>
          <div data-testid="guest-content">Guest Content</div>
        </GuestRoute>
      );

      expect(screen.getByTestId('guest-content')).toBeInTheDocument();
      expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
    });
  });
});
