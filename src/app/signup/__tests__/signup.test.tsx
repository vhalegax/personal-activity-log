import SignUpPage from '../page';
import { AuthProvider } from '@/hooks/use-auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

describe('Signup Page', () => {
  const renderWithProviders = (ui: React.ReactElement) => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    return render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{ui}</AuthProvider>
      </QueryClientProvider>,
    );
  };

  test('shows validation errors for invalid input', async () => {
    renderWithProviders(<SignUpPage />);

    const submit = screen.getByRole('button', { name: /sign up/i });
    await userEvent.click(submit);

    expect(await screen.findByText(/invalid email address/i)).toBeInTheDocument();
    expect(await screen.findByText(/password must be at least 6 characters/i)).toBeInTheDocument();
  });

  test('shows server error for duplicate email', async () => {
    renderWithProviders(<SignUpPage />);

    const emailInput = screen.getByPlaceholderText(/you@example.com/i);
    const passwordInput = screen.getAllByPlaceholderText(/••••••••/i)[0];
    const confirmInput = screen.getAllByPlaceholderText(/••••••••/i)[1];

    await userEvent.type(emailInput, 'exists@example.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.type(confirmInput, 'password123');

    const submit = screen.getByRole('button', { name: /sign up/i });
    await userEvent.click(submit);

    await waitFor(() => {
      const errorMessages = screen.getAllByText(/email already registered/i);
      expect(errorMessages.length).toBeGreaterThan(0);
    });
  });

  test('successful signup shows success message', async () => {
    renderWithProviders(<SignUpPage />);

    const emailInput = screen.getByPlaceholderText(/you@example.com/i);
    const passwordInput = screen.getAllByPlaceholderText(/••••••••/i)[0];
    const confirmInput = screen.getAllByPlaceholderText(/••••••••/i)[1];

    await userEvent.type(emailInput, 'new@example.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.type(confirmInput, 'password123');

    const submit = screen.getByRole('button', { name: /sign up/i });
    await userEvent.click(submit);

    await waitFor(() => {
      expect(screen.getByText(/account created! redirecting to login/i)).toBeInTheDocument();
    });
  });
});
