import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Admin client untuk database operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
);

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    // 1. Check duplicate email di auth.users
    const { data: existingUser, error: checkError } = await supabaseAdmin.auth.admin.listUsers();

    if (checkError) {
      return NextResponse.json({ error: 'Failed to check existing user' }, { status: 500 });
    }

    const userExists = existingUser?.users?.some((u) => u.email === email);
    if (userExists) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    // 2. Create auth user via Supabase Auth API
    const { data, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto confirm email untuk testing
    });

    if (signUpError || !data.user) {
      return NextResponse.json(
        { error: signUpError?.message || 'Failed to create user' },
        { status: 400 },
      );
    }

    // 3. Create or upsert user record di database table `users`
    // Use upsert to avoid conflicts if a trigger already inserted the row.
    const { error: dbError } = await supabaseAdmin.from('users').upsert([
      {
        id: data.user.id,
        email: data.user.email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);

    if (dbError) {
      // If upsert failed, rollback auth user creation and return error
      await supabaseAdmin.auth.admin.deleteUser(data.user.id);
      return NextResponse.json({ error: 'Failed to create user record' }, { status: 500 });
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully. You can now login.',
        userId: data.user.id,
      },
      { status: 201 },
    );
  } catch (err) {
    console.error('Signup error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
