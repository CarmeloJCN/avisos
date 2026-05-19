import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LoginPage from './LoginPage';

// Mock useNavigate from react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate
}));

// Mock useTranslation from react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) => {
      if (options && typeof options === 'object') {
        return `${key} ${JSON.stringify(options)}`;
      }
      return key;
    }
  })
}));

// Mock useAuth from AuthContext
const mockLogin = vi.fn();
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin
  })
}));

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders login form with fields and submit button', () => {
    render(<LoginPage />);

    expect(screen.getByText('AVISOS.LOGIN')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('AVISOS.COMUN.PLACE_EMAIL')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('AVISOS.COMUN.PLACE_PASS')).toBeInTheDocument();
    expect(screen.getByLabelText('AVISOS.LOGIN.RECORDAR')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'AVISOS.COMUN.ACEPTAR' })).toBeInTheDocument();
  });

  it('shows validation errors when fields are touched and left empty', () => {
    render(<LoginPage />);

    const emailInput = screen.getByPlaceholderText('AVISOS.COMUN.PLACE_EMAIL');
    const passwordInput = screen.getByPlaceholderText('AVISOS.COMUN.PLACE_PASS');

    fireEvent.blur(emailInput);
    fireEvent.blur(passwordInput);

    const errorMessages = screen.getAllByText('AVISOS.ERRORES.OBLIGATORIO');
    expect(errorMessages).toHaveLength(2);
  });

  it('shows format validation error for invalid email', () => {
    render(<LoginPage />);

    const emailInput = screen.getByPlaceholderText('AVISOS.COMUN.PLACE_EMAIL');

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput);

    expect(screen.getByText('AVISOS.ERRORES.FORMATO_EMAIL')).toBeInTheDocument();
  });

  it('shows password length validation error for short password', () => {
    render(<LoginPage />);

    const passwordInput = screen.getByPlaceholderText('AVISOS.COMUN.PLACE_PASS');

    fireEvent.change(passwordInput, { target: { value: '123' } });
    fireEvent.blur(passwordInput);

    expect(screen.getByText('AVISOS.ERRORES.PASS_MIN_LENGTH')).toBeInTheDocument();
  });

  it('does not call login on submit when fields are empty', async () => {
    render(<LoginPage />);

    const submitButton = screen.getByRole('button', { name: 'AVISOS.COMUN.ACEPTAR' });
    fireEvent.click(submitButton);

    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('submits successfully and navigates to /avisos on correct credentials', async () => {
    mockLogin.mockResolvedValueOnce(undefined);
    render(<LoginPage />);

    const emailInput = screen.getByPlaceholderText('AVISOS.COMUN.PLACE_EMAIL');
    const passwordInput = screen.getByPlaceholderText('AVISOS.COMUN.PLACE_PASS');
    const submitButton = screen.getByRole('button', { name: 'AVISOS.COMUN.ACEPTAR' });

    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('user@example.com', 'password123');
      expect(mockNavigate).toHaveBeenCalledWith('/avisos');
    });
  });

  it('saves email in localStorage if recordar is checked on submit', async () => {
    mockLogin.mockResolvedValueOnce(undefined);
    render(<LoginPage />);

    const emailInput = screen.getByPlaceholderText('AVISOS.COMUN.PLACE_EMAIL');
    const passwordInput = screen.getByPlaceholderText('AVISOS.COMUN.PLACE_PASS');
    const recordarCheckbox = screen.getByLabelText('AVISOS.LOGIN.RECORDAR');
    const submitButton = screen.getByRole('button', { name: 'AVISOS.COMUN.ACEPTAR' });

    // Ensure it starts checked since localStorage is empty but default is true when there is no email?
    // Let's verify checkbox is checked by default because !!localStorage.getItem('email') would be false if empty,
    // wait, in LoginPage.tsx line 17:
    // const [recordar, setRecordar] = useState(!!localStorage.getItem('email'));
    // Since we cleared localStorage, it should be unchecked initially. Let's check it.
    expect(recordarCheckbox).not.toBeChecked();
    fireEvent.click(recordarCheckbox);
    expect(recordarCheckbox).toBeChecked();

    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(localStorage.getItem('email')).toBe('user@example.com');
    });
  });

  it('removes email from localStorage if recordar is unchecked on submit', async () => {
    localStorage.setItem('email', 'old@example.com');
    mockLogin.mockResolvedValueOnce(undefined);
    render(<LoginPage />);

    const emailInput = screen.getByPlaceholderText('AVISOS.COMUN.PLACE_EMAIL');
    const passwordInput = screen.getByPlaceholderText('AVISOS.COMUN.PLACE_PASS');
    const recordarCheckbox = screen.getByLabelText('AVISOS.LOGIN.RECORDAR');
    const submitButton = screen.getByRole('button', { name: 'AVISOS.COMUN.ACEPTAR' });

    // Since we had 'email' in localStorage, it should start checked.
    expect(recordarCheckbox).toBeChecked();
    fireEvent.click(recordarCheckbox); // Uncheck it
    expect(recordarCheckbox).not.toBeChecked();

    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(localStorage.getItem('email')).toBeNull();
    });
  });

  it('displays correct error message when login fails with wrong password', async () => {
    mockLogin.mockRejectedValueOnce({ code: 'auth/wrong-password' });
    render(<LoginPage />);

    const emailInput = screen.getByPlaceholderText('AVISOS.COMUN.PLACE_EMAIL');
    const passwordInput = screen.getByPlaceholderText('AVISOS.COMUN.PLACE_PASS');
    const submitButton = screen.getByRole('button', { name: 'AVISOS.COMUN.ACEPTAR' });

    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('AVISOS.ERRORES.WRONG_PASS')).toBeInTheDocument();
    });
  });
});
