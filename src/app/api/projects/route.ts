import { supabase } from '@/lib/supabase-client';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Create admin client for server-side operations (bypass RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
);

// Schema for creating a project
const createProjectSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(255),
});

// GET: Fetch all projects for the authenticated user
export async function GET(req: NextRequest) {
  try {
    // Get authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Missing authorization header' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify token and get user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch projects for this user
    const { data, error } = await supabaseAdmin
      .from('projects')
      .select('*')
      .eq('created_by', user.id)
      .is('deleted_at', null)
      .order('name', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ projects: data || [] }, { status: 200 });
  } catch (err) {
    console.error('GET /api/projects error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create a new project
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Get authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Missing authorization header' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify token and get user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate input
    const validatedData = createProjectSchema.parse(body);

    // Check for duplicate name
    const { data: existing } = await supabaseAdmin
      .from('projects')
      .select('id')
      .eq('created_by', user.id)
      .eq('name', validatedData.name)
      .is('deleted_at', null)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Project name already exists' }, { status: 400 });
    }

    // Create project
    const { data, error } = await supabaseAdmin
      .from('projects')
      .insert([
        {
          name: validatedData.name,
          created_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ project: data }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }

    console.error('POST /api/projects error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
