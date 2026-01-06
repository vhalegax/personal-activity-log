import { supabase } from '@/lib/supabase-client';
import { updateTaskSchema } from '@/schemas/task-schema';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';

// Create admin client for server-side operations (bypass RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
);

// GET: Fetch single task by ID
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: taskId } = await params;

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

    // Fetch task
    const { data, error } = await supabaseAdmin
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .is('deleted_at', null)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ task: data }, { status: 200 });
  } catch (err) {
    console.error('GET /api/tasks/[id] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH: Update task
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: taskId } = await params;
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
    const validatedData = updateTaskSchema.parse(body);

    // Update task
    const { data, error } = await supabaseAdmin
      .from('tasks')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', taskId)
      .is('deleted_at', null)
      .select()
      .single();

    if (error || !data) {
      console.error('Supabase update error:', error);
      return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
    }

    return NextResponse.json({ task: data }, { status: 200 });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: err.errors }, { status: 400 });
    }

    console.error('PATCH /api/tasks/[id] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Soft delete task
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: taskId } = await params;

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

    // Soft delete task
    const { error } = await supabaseAdmin
      .from('tasks')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', taskId)
      .is('deleted_at', null);

    if (error) {
      console.error('Supabase delete error:', error);
      return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error('DELETE /api/tasks/[id] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
