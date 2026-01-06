import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
);

// GET /api/time-logs?task_id=xxx&active=true
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get('task_id');
    const activeOnly = searchParams.get('active') === 'true';

    // Get user from auth token
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
    } = await supabaseAdmin.auth.getUser(token);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let query = supabaseAdmin.from('time_logs').select('*').eq('user_id', user.id);

    if (taskId) {
      query = query.eq('task_id', taskId);
    }

    if (activeOnly) {
      query = query.is('end_at', null);
    }

    query = query.order('start_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ timeLogs: data || [] });
  } catch (err) {
    console.error('GET /api/time-logs error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/time-logs - Start timer
export async function POST(req: NextRequest) {
  try {
    const { task_id } = await req.json();

    if (!task_id) {
      return NextResponse.json({ error: 'task_id is required' }, { status: 400 });
    }

    // Get user from auth token
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
    } = await supabaseAdmin.auth.getUser(token);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check for existing active time log
    const { data: existingLogs } = await supabaseAdmin
      .from('time_logs')
      .select('*')
      .eq('task_id', task_id)
      .eq('user_id', user.id)
      .is('end_at', null);

    if (existingLogs && existingLogs.length > 0) {
      return NextResponse.json({ error: 'Timer already running for this task' }, { status: 400 });
    }

    // Create new time log
    const { data, error } = await supabaseAdmin
      .from('time_logs')
      .insert([
        {
          task_id,
          user_id: user.id,
          start_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ timeLog: data }, { status: 201 });
  } catch (err) {
    console.error('POST /api/time-logs error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/time-logs - Stop timer
export async function PATCH(req: NextRequest) {
  try {
    const { time_log_id } = await req.json();

    if (!time_log_id) {
      return NextResponse.json({ error: 'time_log_id is required' }, { status: 400 });
    }

    // Get user from auth token
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
    } = await supabaseAdmin.auth.getUser(token);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the time log
    const { data: timeLog, error: fetchError } = await supabaseAdmin
      .from('time_logs')
      .select('*')
      .eq('id', time_log_id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !timeLog) {
      return NextResponse.json({ error: 'Time log not found' }, { status: 404 });
    }

    if (timeLog.end_at) {
      return NextResponse.json({ error: 'Timer already stopped' }, { status: 400 });
    }

    // Calculate duration
    const endTime = new Date();
    const startTime = new Date(timeLog.start_at);
    const durationSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

    // Update time log
    const { data, error } = await supabaseAdmin
      .from('time_logs')
      .update({
        end_at: endTime.toISOString(),
        duration: durationSeconds,
        updated_at: new Date().toISOString(),
      })
      .eq('id', time_log_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ timeLog: data });
  } catch (err) {
    console.error('PATCH /api/time-logs error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
