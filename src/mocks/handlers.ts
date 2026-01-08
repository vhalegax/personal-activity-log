import { http, HttpResponse } from 'msw';

export const handlers = [
  http.post('/api/auth/signup', async ({ request }) => {
    const body = await request.json();
    const email = (body as any)?.email;

    if (!email) {
      return HttpResponse.json({ error: 'email required' }, { status: 400 });
    }

    if (email === 'exists@example.com') {
      return HttpResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    return HttpResponse.json({ success: true }, { status: 201 });
  }),
];
