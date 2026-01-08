import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
);

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Debug endpoint only available in development' },
      { status: 403 },
    );
  }

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
