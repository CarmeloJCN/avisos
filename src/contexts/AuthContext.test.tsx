import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';
import { signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from 'firebase/auth';

// Mock firebase/auth
let authStateCallback: any = null;
vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  onAuthStateChanged: vi.fn((_authInstance, callback) => {
    authStateCallback = callback;
    return vi.fn(); // Mock unsubscribe
  })
}));

// Mock firebase db config
vi.mock('../services/firebase', () => ({
  auth: { uid: 'mock-auth-instance' }
}));

// Test consumer component
function TestConsumer() {
  const { user, isLoggedIn, login, logout, sendPasswordReset } = useAuth();
  return (
    <div>
      <div data-testid="is-logged-in">{isLoggedIn ? 'yes' : 'no'}</div>
      <div data-testid="user-email">{user ? user.email : 'none'}</div>
      <button onClick={() => login('user@test.com', 'pass123')}>Do Login</button>
      <button onClick={logout}>Do Logout</button>
      <button onClick={() => sendPasswordReset('user@test.com')}>Do Reset</button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    authStateCallback = null;
  });

  it('initializes with null user when localStorage is empty', () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId('is-logged-in').textContent).toBe('no');
    expect(screen.getByTestId('user-email').textContent).toBe('none');
  });

  it('initializes with cached user if present in localStorage', () => {
    const cachedUser = { uid: '123', email: 'cached@test.com' };
    localStorage.setItem('user', JSON.stringify(cachedUser));

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId('is-logged-in').textContent).toBe('yes');
    expect(screen.getByTestId('user-email').textContent).toBe('cached@test.com');
  });

  it('updates state and localStorage when onAuthStateChanged fires with user', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(authStateCallback).toBeDefined();

    // Simulate firebase auth state change (sign-in)
    const newUser = { uid: '456', email: 'new@test.com' };
    act(() => {
      authStateCallback(newUser);
    });

    expect(screen.getByTestId('is-logged-in').textContent).toBe('yes');
    expect(screen.getByTestId('user-email').textContent).toBe('new@test.com');
    expect(JSON.parse(localStorage.getItem('user')!)).toEqual(newUser);
  });

  it('removes state and localStorage when onAuthStateChanged fires with null', () => {
    const cachedUser = { uid: '123', email: 'cached@test.com' };
    localStorage.setItem('user', JSON.stringify(cachedUser));

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    // Simulate firebase auth state change (sign-out)
    act(() => {
      authStateCallback(null);
    });

    expect(screen.getByTestId('is-logged-in').textContent).toBe('no');
    expect(screen.getByTestId('user-email').textContent).toBe('none');
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('calls signInWithEmailAndPassword on login', async () => {
    vi.mocked(signInWithEmailAndPassword).mockResolvedValueOnce({} as any);

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText('Do Login'));

    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      'user@test.com',
      'pass123'
    );
  });

  it('calls signOut and clears localStorage on logout', async () => {
    localStorage.setItem('user', JSON.stringify({ email: 'user@test.com' }));
    vi.mocked(signOut).mockResolvedValueOnce();

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText('Do Logout'));

    await waitFor(() => {
      expect(signOut).toHaveBeenCalledTimes(1);
      expect(localStorage.getItem('user')).toBeNull();
    });
  });

  it('calls sendPasswordResetEmail on reset', () => {
    vi.mocked(sendPasswordResetEmail).mockResolvedValueOnce();

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText('Do Reset'));

    expect(sendPasswordResetEmail).toHaveBeenCalledWith(expect.anything(), 'user@test.com');
  });

  it('throws error when useAuth is consumed outside of AuthProvider', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => render(<TestConsumer />)).toThrow('useAuth must be used within AuthProvider');
    
    consoleErrorSpy.mockRestore();
  });
});
