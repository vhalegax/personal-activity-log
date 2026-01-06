import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Supabase client
vi.mock('@/lib/supabase-client', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
  },
}));

// Lightweight fetch mock for tests to simulate API routes
const originalFetch = globalThis.fetch;

beforeAll(() => {
  // @ts-ignore
  globalThis.fetch = async (input: RequestInfo, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : (input as Request).url;

    if (url.endsWith('/api/auth/signup')) {
      const bodyText = init?.body ? String(init.body) : undefined;
      let body: any = {};
      try {
        body = bodyText ? JSON.parse(bodyText) : {};
      } catch (e) {
        // ignore
      }

      const email = body?.email;
      if (!email) {
        return new Response(JSON.stringify({ error: 'email required' }), { status: 400 });
      }

      if (email === 'exists@example.com') {
        return new Response(JSON.stringify({ error: 'Email already registered' }), { status: 400 });
      }

      return new Response(JSON.stringify({ success: true }), { status: 201 });
    }

    return originalFetch ? originalFetch(input, init) : new Response(null, { status: 404 });
  };
});

afterAll(() => {
  // restore original fetch
  // @ts-ignore
  globalThis.fetch = originalFetch;
});
