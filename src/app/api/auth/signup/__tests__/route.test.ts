import { NextRequest } from 'next/server';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';

// Declare mock functions first (before vi.mock)
const mockListUsers = vi.fn();
const mockCreateUser = vi.fn();
const mockDeleteUser = vi.fn();
const mockFrom = vi.fn();
const mockUpsert = vi.fn();

// Mock Supabase client at module level
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      admin: {
        listUsers: mockListUsers,
        createUser: mockCreateUser,
        deleteUser: mockDeleteUser,
      },
    },
    from: mockFrom,
  })),
}));

// Import after mocking
const { POST } = await import('../route');

describe('POST /api/auth/signup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({
      upsert: mockUpsert,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return error when email already exists', async () => {
    mockListUsers.mockResolvedValue({
      data: { users: [{ email: 'existing@example.com', id: '123' }] },
      error: null,
    });

    const request = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email: 'existing@example.com', password: 'password123' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Email already registered');
  });

  it('should create user successfully with valid credentials', async () => {
    mockListUsers.mockResolvedValue({
      data: { users: [] },
      error: null,
    });

    mockCreateUser.mockResolvedValue({
      data: { user: { id: 'new-user-id', email: 'new@example.com' } },
      error: null,
    });

    mockUpsert.mockResolvedValue({
      data: null,
      error: null,
    });

    const request = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email: 'new@example.com', password: 'password123' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.message).toBe('Account created successfully. You can now login.');
    expect(data.userId).toBe('new-user-id');
  });

  it('should rollback auth user creation if database insert fails', async () => {
    mockListUsers.mockResolvedValue({
      data: { users: [] },
      error: null,
    });

    mockCreateUser.mockResolvedValue({
      data: { user: { id: 'new-user-id', email: 'new@example.com' } },
      error: null,
    });

    mockUpsert.mockResolvedValue({
      data: null,
      error: { message: 'Database error' },
    });

    const request = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email: 'new@example.com', password: 'password123' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to create user record');
    expect(mockDeleteUser).toHaveBeenCalledWith('new-user-id');
  });

  it('should handle auth user creation error', async () => {
    mockListUsers.mockResolvedValue({
      data: { users: [] },
      error: null,
    });

    mockCreateUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Auth error' },
    });

    const request = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com', password: 'weak' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Auth error');
  });

  it('should handle internal server error when checking existing user fails', async () => {
    mockListUsers.mockResolvedValue({
      data: null,
      error: { message: 'Database connection error' },
    });

    const request = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to check existing user');
  });
});
