import { NextResponse } from "next/server";
import { db, helpers } from "@/lib/fakeDb";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  const body = await req.json();

  const t = db.tasks.find((x) => x.id === id && !x.deleted_at);

  if (!t) return NextResponse.json({ error: "not found" }, { status: 404 });

  if (body.title) t.title = body.title;

  if (body.description !== undefined) t.description = body.description;

  if (body.status) t.status = body.status;

  if (body.type) t.type = body.type;

  if (body.project_id !== undefined) t.project_id = body.project_id;

  return NextResponse.json({ task: t });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  const t = db.tasks.find((x) => x.id === id && !x.deleted_at);

  if (!t) return NextResponse.json({ error: "not found" }, { status: 404 });

  helpers.softDelete(t);

  return NextResponse.json({ ok: true });
}
