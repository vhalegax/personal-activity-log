import * as msw from 'msw';

const { rest } = msw;

export const handlers = [
  rest.post('/api/auth/signup', async (req, res, ctx) => {
    const body = await req.json();
    const email = body?.email;

    if (!email) {
      return res(ctx.status(400), ctx.json({ error: 'email required' }));
    }

    if (email === 'exists@example.com') {
      return res(ctx.status(400), ctx.json({ error: 'Email already registered' }));
    }

    return res(ctx.status(201), ctx.json({ success: true }));
  }),
];
