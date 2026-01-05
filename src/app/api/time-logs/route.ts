import { NextResponse } from "next/server";
import { db } from "@/lib/fakeDb";

export async function POST(req: Request) {
  const body = await req.json();

  const { action, task_id, user_email } = body || {};

  if (!action || !task_id || !user_email)
    return NextResponse.json({ error: "missing" }, { status: 400 });

  const user = db.findOrCreateUserByEmail(user_email);

  if (action === "start") {
    // ensure no active time log for this task
    const active = db.timeLogs.find(
      (t) => t.task_id === task_id && t.end_at == null && t.user_id === user.id
    );

    if (active)
      return NextResponse.json(
        { error: "task already running" },
        { status: 400 }
      );

    const tl = {
      id: `tl_${Date.now()}`,
      task_id,
      user_id: user.id,
      start_at: new Date().toISOString(),
      end_at: null,
    };

    db.timeLogs.push(tl);
    return NextResponse.json({ timeLog: tl });
  }

  if (action === "stop") {
    const active = db.timeLogs.find(
      (t) => t.task_id === task_id && t.end_at == null && t.user_id === user.id
    );

    if (!active)
      return NextResponse.json(
        { error: "no active time log" },
        { status: 400 }
      );

    active.end_at = new Date().toISOString();
    return NextResponse.json({ timeLog: active });
  }

  return NextResponse.json({ error: "unknown action" }, { status: 400 });
}

export async function GET() {
  return NextResponse.json({ timeLogs: db.timeLogs });
}
