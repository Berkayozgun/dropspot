import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RegisterPage from '../../../app/auth/register/page';
import { useRouter } from 'next/navigation';

// Mock the next/navigation useRouter
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('RegisterPage', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the registration form', () => {
    render(<RegisterPage />);

    expect(screen.getByLabelText(/Adınız/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/E-posta/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Şifre/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Kayıt Ol/i })).toBeInTheDocument();
  });

  it('should allow typing in name, email, and password fields', () => {
    render(<RegisterPage />);

    const nameInput = screen.getByLabelText(/Adınız/i);
    const emailInput = screen.getByLabelText(/E-posta/i);
    const passwordInput = screen.getByLabelText(/Şifre/i);

    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(emailInput, { target: { value: 'register@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'securepassword' } });

    expect(nameInput).toHaveValue('Test User');
    expect(emailInput).toHaveValue('register@example.com');
    expect(passwordInput).toHaveValue('securepassword');
  });

  it('should redirect to login on successful registration', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'Kayıt başarılı!' }),
      } as Response)
    );

    render(<RegisterPage />);

    fireEvent.change(screen.getByLabelText(/Adınız/i), { target: { value: 'New User' } });
    fireEvent.change(screen.getByLabelText(/E-posta/i), { target: { value: 'newuser@example.com' } });
    fireEvent.change(screen.getByLabelText(/Şifre/i), { target: { value: 'newpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /Kayıt Ol/i }));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/auth/login'));
  });

  it('should display error message on failed registration', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'Bu e-posta zaten kullanılıyor.' }),
        status: 400,
      } as Response)
    );

    render(<RegisterPage />);

    fireEvent.change(screen.getByLabelText(/Adınız/i), { target: { value: 'Fail User' } });
    fireEvent.change(screen.getByLabelText(/E-posta/i), { target: { value: 'fail@example.com' } });
    fireEvent.change(screen.getByLabelText(/Şifre/i), { target: { value: 'failpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /Kayıt Ol/i }));

    await waitFor(() => expect(screen.getByText(/Bu e-posta zaten kullanılıyor./i)).toBeInTheDocument());
    expect(mockPush).not.toHaveBeenCalled();
  });
});
