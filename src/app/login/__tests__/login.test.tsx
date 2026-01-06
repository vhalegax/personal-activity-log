import LoginPage from '../page';
import { AuthProvider } from '@/hooks/use-auth';
import * as supabaseClient from '@/lib/supabase-client';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { vi } from 'vitest';

// Mock the supabase signInWithPassword method
const mockSignIn = vi.fn();
vi.spyOn(supabaseClient.supabase.auth, 'signInWithPassword').mockImplementation(mockSignIn);

describe('Login Page', () => {
  const renderWithProviders = (ui: React.ReactElement) => {
    return render(<AuthProvider>{ui}</AuthProvider>);
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders login form with all elements', async () => {
    renderWithProviders(<LoginPage />);

    // Wait for any async operations to complete
    await waitFor(() => {
      expect(screen.queryByLabelText(/email/i)).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  test('requires email and password fields', async () => {
    renderWithProviders(<LoginPage />);

    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;

    expect(emailInput.required).toBe(true);
    expect(passwordInput.required).toBe(true);
  });

  test('shows error message for invalid credentials', async () => {
    mockSignIn.mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: 'Invalid login credentials' },
    });

    renderWithProviders(<LoginPage />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await userEvent.type(emailInput, 'wrong@example.com');
    await userEvent.type(passwordInput, 'wrongpassword');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid login credentials/i)).toBeInTheDocument();
    });
  });

  test('successful login calls signIn with correct credentials', async () => {
    mockSignIn.mockResolvedValueOnce({
      data: {
        user: { id: '123', email: 'test@example.com' },
        session: { access_token: 'token' },
      },
      error: null,
    });

    renderWithProviders(<LoginPage />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  test('disables form during submission', async () => {
    mockSignIn.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ data: {}, error: null }), 100)),
    );

    renderWithProviders(<LoginPage />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(submitButton);

    // Check that button shows loading state
    expect(screen.getByText(/signing in/i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  test('shows link to signup page', () => {
    renderWithProviders(<LoginPage />);

    const signupLink = screen.getByRole('link', { name: /sign up/i });
    expect(signupLink).toHaveAttribute('href', '/signup');
  });
});
