import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from '../../../app/auth/login/page';
import { AuthProvider, useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';

// Mock the next/navigation useRouter
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock the AuthContext (or you can use a real one if you prefer)
jest.mock('../../../context/AuthContext', () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

describe('LoginPage', () => {
  const mockLogin = jest.fn();
  const mockPush = jest.fn();

  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      login: mockLogin,
      logout: jest.fn(),
    });
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the login form', () => {
    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    );

    expect(screen.getByLabelText(/E-posta/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Şifre/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Giriş Yap/i })).toBeInTheDocument();
  });

  it('should allow typing in email and password fields', () => {
    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    );

    const emailInput = screen.getByLabelText(/E-posta/i);
    const passwordInput = screen.getByLabelText(/Şifre/i);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  it('should call login on successful submission and redirect to home', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ token: 'mock-token', user: { email: 'test@example.com' } }),
      } as Response)
    );

    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    );

    fireEvent.change(screen.getByLabelText(/E-posta/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Şifre/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /Giriş Yap/i }));

    await waitFor(() => expect(mockLogin).toHaveBeenCalledWith('mock-token'));
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/'));
  });

  it('should display error message on failed login', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'Geçersiz kimlik bilgileri' }),
        status: 401,
      } as Response)
    );

    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    );

    fireEvent.change(screen.getByLabelText(/E-posta/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Şifre/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /Giriş Yap/i }));

    await waitFor(() => expect(screen.getByText(/Geçersiz kimlik bilgileri/i)).toBeInTheDocument());
    expect(mockLogin).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });
});
