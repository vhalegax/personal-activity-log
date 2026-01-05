import { NextResponse } from "next/server";
import { db } from "@/lib/fakeDb";

export async function GET() {
  const tasks = db.tasks.filter((t) => !t.deleted_at);

  return NextResponse.json({ tasks });
}

export async function POST(req: Request) {
  const body = await req.json();

  const { title, user_email } = body || {};

  if (!title)
    return NextResponse.json({ error: "title required" }, { status: 400 });

  if (!user_email)
    return NextResponse.json({ error: "user_email required" }, { status: 400 });

  const user = db.findOrCreateUserByEmail(user_email);

  const task = {
    id: `task_${Date.now()}`,
    title,
    description: body.description || "",
    project_id: body.project_id || null,
    requester: body.requester || null,
    pic: body.pic || null,
    status: (body.status as any) || "To Do",
    type: (body.type as any) || "Working",
    created_by: user.id,
    created_at: new Date().toISOString(),
  };

  db.tasks.push(task);

  return NextResponse.json({ task });
}
