import { NextResponse } from "next/server";
import { db } from "@/lib/fakeDb";

function msToHours(ms: number) {
  return ms / (1000 * 60 * 60);
}

export async function GET(req: Request) {
  const url = new URL(req.url);

  const range = url.searchParams.get("range") || "today";

  // naive handling: support today only for MVP
  const today = new Date();

  const start = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const logs = db.timeLogs.filter((l) => {
    const s = new Date(l.start_at).getTime();
    return s >= start.getTime() && s < end.getTime();
  });

  const byTask: Record<string, { taskId: string; totalMs: number }> = {};

  for (const l of logs) {
    const endAt = l.end_at ? new Date(l.end_at).getTime() : Date.now();
    const startAt = new Date(l.start_at).getTime();
    const dur = Math.max(0, endAt - startAt);
    byTask[l.task_id] = byTask[l.task_id] || { taskId: l.task_id, totalMs: 0 };
    byTask[l.task_id].totalMs += dur;
  }

  const items = Object.values(byTask).map((it) => ({
    task_id: it.taskId,
    hours: msToHours(it.totalMs),
  }));

  const totalHours = items.reduce((s, it) => s + it.hours, 0);

  return NextResponse.json({ items, totalHours });
}
