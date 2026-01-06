import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

if (process.env.NODE_ENV !== 'development') {
  throw new Error('Debug endpoint only available in development');
}

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
);

export async function GET(req: NextRequest) {
  try {
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    if (authError) return NextResponse.json({ error: authError.message }, { status: 500 });

    const { data: dbUsers, error: dbError } = await supabaseAdmin
      .from('users')
      .select('id, email, created_at');
    if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });

    return NextResponse.json({
      authUsers: authUsers.users?.map((u) => ({ id: u.id, email: u.email })),
      dbUsers,
    });
  } catch (err) {
    console.error('debug/users error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
