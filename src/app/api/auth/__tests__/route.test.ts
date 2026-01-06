import { POST } from '../route';
import { db } from '@/lib/fakeDb';
import { NextRequest } from 'next/server';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fakeDb
vi.mock('@/lib/fakeDb', () => ({
  db: {
    findOrCreateUserByEmail: vi.fn(),
  },
}));

describe('POST /api/auth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return error when email is missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('email required');
  });

  it('should return error when email is not a string', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth', {
      method: 'POST',
      body: JSON.stringify({ email: 123 }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('email required');
  });

  it('should create or find user with valid email', async () => {
    const mockUser = { id: '123', email: 'test@example.com' };
    vi.mocked(db.findOrCreateUserByEmail).mockReturnValue(mockUser);

    const request = new NextRequest('http://localhost:3000/api/auth', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.user).toEqual(mockUser);
    expect(db.findOrCreateUserByEmail).toHaveBeenCalledWith('test@example.com');
  });
});
