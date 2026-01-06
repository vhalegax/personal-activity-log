import { supabase } from '@/lib/supabase-client';
import { createTaskSchema, filterTasksSchema } from '@/schemas/task-schema';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';

// Create admin client for server-side operations (bypass RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
);

// GET: Fetch all tasks with filters
export async function GET(req: NextRequest) {
  try {
    // Parse query parameters
    const searchParams = req.nextUrl.searchParams;
    const filters = {
      search: searchParams.get('search') || undefined,
      status: searchParams.get('status') || undefined,
      type: searchParams.get('type') || undefined,
      project_id: searchParams.get('project_id') || undefined,
      requester: searchParams.get('requester') || undefined,
      pic: searchParams.get('pic') || undefined,
      limit: parseInt(searchParams.get('limit') || '50'),
      offset: parseInt(searchParams.get('offset') || '0'),
    };

    // Validate filters
    const validatedFilters = filterTasksSchema.parse(filters);

    // Start building query
    let query = supabase
      .from('tasks')
      .select('*')
      .is('deleted_at', null) // Soft delete check
      .order('created_at', { ascending: false });

    // Apply filters (only if provided)
    if (validatedFilters.search) {
      // Search across multiple fields: title, description, pic, requester
      query = query.or(
        `title.ilike.%${validatedFilters.search}%,description.ilike.%${validatedFilters.search}%,pic.ilike.%${validatedFilters.search}%,requester.ilike.%${validatedFilters.search}%`,
      );
    }

    if (validatedFilters.status) {
      query = query.eq('status', validatedFilters.status);
    }

    if (validatedFilters.type) {
      query = query.eq('type', validatedFilters.type);
    }

    if (validatedFilters.project_id) {
      query = query.eq('project_id', validatedFilters.project_id);
    }

    if (validatedFilters.requester) {
      query = query.ilike('requester', `%${validatedFilters.requester}%`);
    }

    if (validatedFilters.pic) {
      query = query.ilike('pic', `%${validatedFilters.pic}%`);
    }

    // Apply pagination
    query = query.range(
      validatedFilters.offset,
      validatedFilters.offset + validatedFilters.limit - 1,
    );

    // Execute query
    const { data, error, count } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        tasks: data || [],
        count: count || 0,
        limit: validatedFilters.limit,
        offset: validatedFilters.offset,
      },
      { status: 200 },
    );
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        { error: 'Invalid filter parameters', details: err.errors },
        { status: 400 },
      );
    }

    console.error('GET /api/tasks error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create new task
export async function POST(req: NextRequest) {
  try {
    // Get request body
    const body = await req.json();

    // Get authorization header (contains session token)
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Missing authorization header' }, { status: 401 });
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.replace('Bearer ', '');

    // Verify token dan get user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate input with schema
    const validatedData = createTaskSchema.parse(body);

    // Use admin client to bypass RLS and insert task with real user ID
    const { data, error } = await supabaseAdmin
      .from('tasks')
      .insert([
        {
          title: validatedData.title,
          description: validatedData.description || null,
          project_id: validatedData.project_id || null,
          requester: validatedData.requester || null,
          pic: validatedData.pic || null,
          status: validatedData.status,
          type: validatedData.type,
          created_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted_at: null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ task: data }, { status: 201 });
  } catch (err) {
    if (err instanceof ZodError) {
      // Return validation errors dengan field info
      const fieldErrors: Record<string, string> = {};
      err.errors.forEach((error) => {
        const fieldPath = error.path.join('.');
        fieldErrors[fieldPath] = error.message;
      });
      return NextResponse.json({ error: 'Validation error', fieldErrors }, { status: 400 });
    }

    if (err instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    console.error('POST /api/tasks error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
