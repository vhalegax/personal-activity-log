import TasksPage from '../page';
import * as supabaseClient from '@/lib/supabase-client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock Supabase
vi.mock('@/lib/supabase-client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
  },
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

// Mock fetch
const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

describe('Tasks Page', () => {
  const renderWithProviders = (ui: React.ReactElement) => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
    vi.mocked(supabaseClient.supabase.auth.getSession).mockResolvedValue({
      data: {
        session: { access_token: 'test-token', user: { id: '123' } },
      },
    } as any);
  });

  it('renders task list with truncated descriptions', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        tasks: [
          {
            id: '1',
            title: 'Test Task',
            description: 'This is a very long description that should be truncated',
            type: 'Working',
            status: 'To Do',
            created_at: '2026-01-07T00:00:00Z',
          },
        ],
      }),
    } as any);

    renderWithProviders(<TasksPage />);

    // Use findByText which waits automatically
    const taskTitle = await screen.findByText('Test Task', {}, { timeout: 3000 });
    expect(taskTitle).toBeInTheDocument();

    // Description should be truncated to 30 chars
    const description = await screen.findByText(/This is a very long description/i);
    expect(description.textContent).toContain('...');
    expect(description.textContent?.length).toBeLessThanOrEqual(35);
  });

  it('displays empty state when no tasks', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ tasks: [] }),
    } as any);

    renderWithProviders(<TasksPage />);

    const emptyMessage = await screen.findByText(/no tasks found/i, {}, { timeout: 3000 });
    expect(emptyMessage).toBeInTheDocument();
  });

  it('allows creating a new task', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ tasks: [] }),
      } as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ task: { id: '1', title: 'New Task' } }),
      } as any);

    renderWithProviders(<TasksPage />);

    await waitFor(() => {
      expect(screen.getByText(/create task/i)).toBeInTheDocument();
    });

    // Click create task button
    const createButton = screen.getByRole('button', { name: /create task/i });
    await userEvent.click(createButton);

    // Fill form
    const titleInput = screen.getByPlaceholderText(/task title/i);
    await userEvent.type(titleInput, 'New Task');

    const descriptionInput = screen.getByPlaceholderText(/task description/i);
    await userEvent.type(descriptionInput, 'Task description');

    // Submit
    const submitButton = screen.getAllByRole('button', { name: /create task/i })[1];
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/tasks',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('New Task'),
        }),
      );
    });
  });

  it('filters tasks by search query', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          tasks: [
            { id: '1', title: 'Task 1', type: 'Working', status: 'To Do' },
            { id: '2', title: 'Task 2', type: 'Learning', status: 'Done' },
          ],
        }),
      } as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          tasks: [{ id: '1', title: 'Task 1', type: 'Working', status: 'To Do' }],
        }),
      } as any);

    renderWithProviders(<TasksPage />);

    await screen.findByText('Task 1', {}, { timeout: 3000 });

    // Type in search input
    const searchInput = screen.getByPlaceholderText(/search by title/i);
    await userEvent.type(searchInput, 'Task 1');

    // Click search button to trigger search
    const searchButton = screen.getByRole('button', { name: /search/i });
    await userEvent.click(searchButton);

    // Should trigger new query with search param
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('search=Task%201'),
        expect.any(Object),
      );
    });
  });
});
