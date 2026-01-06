import { GET, POST, PATCH } from '../route';
import { NextRequest } from 'next/server';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';

// Declare mock functions
const mockGetUser = vi.fn();
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockFrom = vi.fn();

// Mock Supabase client
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: mockGetUser,
    },
    from: mockFrom,
  })),
}));

// Import after mocking
const { GET: getTimeLogs, POST: startTimer, PATCH: stopTimer } = await import('../route');

describe('POST /api/time-logs - Start Timer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
    });
  });

  it('should prevent double start - returns error if timer already running', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
    });

    // Mock existing active time log
    mockSelect.mockReturnThis();
    mockSelect.mockImplementation(function (this: any) {
      if (this.eq) return this;
      return {
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockResolvedValue({
          data: [{ id: 'existing-log', task_id: 'task-1', end_at: null }],
        }),
      };
    });

    const request = new NextRequest('http://localhost:3000/api/time-logs', {
      method: 'POST',
      headers: { authorization: 'Bearer test-token' },
      body: JSON.stringify({ task_id: 'task-1' }),
    });

    const response = await startTimer(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Timer already running for this task');
  });

  it('should start timer successfully when no active timer exists', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
    });

    // No existing active time log
    mockFrom.mockImplementation((table: string) => {
      if (table === 'time_logs') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                is: () =>
                  Promise.resolve({
                    data: [],
                  }),
              }),
            }),
          }),
          insert: () => ({
            select: () => ({
              single: () =>
                Promise.resolve({
                  data: {
                    id: 'new-log',
                    task_id: 'task-1',
                    user_id: 'user-123',
                    start_at: new Date().toISOString(),
                    end_at: null,
                  },
                  error: null,
                }),
            }),
          }),
        };
      }
      return {};
    });

    const request = new NextRequest('http://localhost:3000/api/time-logs', {
      method: 'POST',
      headers: { authorization: 'Bearer test-token' },
      body: JSON.stringify({ task_id: 'task-1' }),
    });

    const response = await startTimer(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.timeLog).toBeDefined();
    expect(data.timeLog.task_id).toBe('task-1');
  });

  it('should return 401 when not authenticated', async () => {
    const request = new NextRequest('http://localhost:3000/api/time-logs', {
      method: 'POST',
      body: JSON.stringify({ task_id: 'task-1' }),
    });

    const response = await startTimer(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return 400 when task_id is missing', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
    });

    const request = new NextRequest('http://localhost:3000/api/time-logs', {
      method: 'POST',
      headers: { authorization: 'Bearer test-token' },
      body: JSON.stringify({}),
    });

    const response = await startTimer(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('task_id is required');
  });
});

describe('PATCH /api/time-logs - Stop Timer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should stop timer and calculate duration', async () => {
    const startTime = new Date('2026-01-07T10:00:00Z');

    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
    });

    mockFrom.mockImplementation((table: string) => {
      if (table === 'time_logs') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                single: () =>
                  Promise.resolve({
                    data: {
                      id: 'log-1',
                      task_id: 'task-1',
                      user_id: 'user-123',
                      start_at: startTime.toISOString(),
                      end_at: null,
                    },
                    error: null,
                  }),
              }),
            }),
          }),
          update: (data: any) => ({
            eq: () => ({
              select: () => ({
                single: () =>
                  Promise.resolve({
                    data: {
                      id: 'log-1',
                      end_at: data.end_at,
                      duration: data.duration,
                    },
                    error: null,
                  }),
              }),
            }),
          }),
        };
      }
      return {};
    });

    const request = new NextRequest('http://localhost:3000/api/time-logs', {
      method: 'PATCH',
      headers: { authorization: 'Bearer test-token' },
      body: JSON.stringify({ time_log_id: 'log-1' }),
    });

    const response = await stopTimer(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.timeLog).toBeDefined();
    expect(data.timeLog.end_at).toBeDefined();
    // Duration should be calculated (will be a positive number of seconds)
    expect(typeof data.timeLog.duration).toBe('number');
  });

  it('should return error when timer already stopped', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
    });

    mockFrom.mockImplementation((table: string) => {
      if (table === 'time_logs') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                single: () =>
                  Promise.resolve({
                    data: {
                      id: 'log-1',
                      end_at: '2026-01-07T11:00:00Z', // Already stopped
                    },
                    error: null,
                  }),
              }),
            }),
          }),
        };
      }
      return {};
    });

    const request = new NextRequest('http://localhost:3000/api/time-logs', {
      method: 'PATCH',
      headers: { authorization: 'Bearer test-token' },
      body: JSON.stringify({ time_log_id: 'log-1' }),
    });

    const response = await stopTimer(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Timer already stopped');
  });
});

describe('GET /api/time-logs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch time logs for a task sorted newest first', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
    });

    const timeLogs = [
      {
        id: 'log-2',
        start_at: '2026-01-07T12:00:00Z',
        end_at: '2026-01-07T13:00:00Z',
        duration: 3600,
      },
      {
        id: 'log-1',
        start_at: '2026-01-07T10:00:00Z',
        end_at: '2026-01-07T11:00:00Z',
        duration: 3600,
      },
    ];

    mockFrom.mockImplementation((table: string) => {
      if (table === 'time_logs') {
        return {
          select: () => ({
            eq: (field: string, value: string) => {
              if (field === 'user_id') {
                return {
                  eq: () => ({
                    order: () => Promise.resolve({ data: timeLogs, error: null }),
                  }),
                };
              }
              return {
                order: () => Promise.resolve({ data: timeLogs, error: null }),
              };
            },
          }),
        };
      }
      return {};
    });

    const request = new NextRequest('http://localhost:3000/api/time-logs?task_id=task-1', {
      method: 'GET',
      headers: { authorization: 'Bearer test-token' },
    });

    const response = await getTimeLogs(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.timeLogs).toHaveLength(2);
    // Sorted newest first
    expect(data.timeLogs[0].id).toBe('log-2');
  });
});
