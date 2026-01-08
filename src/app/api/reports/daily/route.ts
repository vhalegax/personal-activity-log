import { db } from '@/lib/fakeDb';
import { NextResponse } from 'next/server';

function msToHours(ms: number) {
  return ms / (1000 * 60 * 60);
}

function getDateRange(
  range: string,
  customStart?: string,
  customEnd?: string,
): { start: Date; end: Date } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (range === 'week') {
    const start = new Date(today);
    const day = start.getDay();
    start.setDate(start.getDate() - day);

    const end = new Date(start);
    end.setDate(end.getDate() + 7);

    return { start, end };
  }

  if (range === 'custom' && customStart && customEnd) {
    return {
      start: new Date(customStart),
      end: new Date(customEnd),
    };
  }

  // default: today
  const start = new Date(today);
  const end = new Date(today);
  end.setDate(end.getDate() + 1);

  return { start, end };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const range = url.searchParams.get('range') || 'today';
  const customStart = url.searchParams.get('start');
  const customEnd = url.searchParams.get('end');

  const { start, end } = getDateRange(range, customStart ?? undefined, customEnd ?? undefined);

  const logs = db.timeLogs.filter((l) => {
    const s = new Date(l.start_at).getTime();
    return s >= start.getTime() && s < end.getTime();
  });

  const byTaskId: Record<
    string,
    {
      taskId: string;
      title: string;
      type: string;
      totalMs: number;
      logCount: number;
    }
  > = {};

  for (const l of logs) {
    const task = db.tasks.find((t) => t.id === l.task_id);
    if (!task) continue;

    const endAt = l.end_at ? new Date(l.end_at).getTime() : Date.now();
    const startAt = new Date(l.start_at).getTime();
    const dur = Math.max(0, endAt - startAt);

    if (!byTaskId[l.task_id]) {
      byTaskId[l.task_id] = {
        taskId: l.task_id,
        title: task.title,
        type: task.type,
        totalMs: 0,
        logCount: 0,
      };
    }

    byTaskId[l.task_id].totalMs += dur;
    byTaskId[l.task_id].logCount += 1;
  }

  const tasks = Object.values(byTaskId).map((it) => ({
    taskId: it.taskId,
    title: it.title,
    type: it.type,
    hours: msToHours(it.totalMs),
    logCount: it.logCount,
  }));

  // Group by type
  const byType: Record<string, { type: string; totalHours: number; taskCount: number }> = {};

  for (const task of tasks) {
    const type = task.type;
    if (!byType[type]) {
      byType[type] = { type, totalHours: 0, taskCount: 0 };
    }
    byType[type].totalHours += task.hours;
    byType[type].taskCount += 1;
  }

  const totalHours = tasks.reduce((s, t) => s + t.hours, 0);

  return NextResponse.json({
    range,
    period: { start: start.toISOString(), end: end.toISOString() },
    tasks,
    byType: Object.values(byType),
    totalHours,
  });
}
