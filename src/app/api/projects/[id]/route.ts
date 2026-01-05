import { NextResponse } from "next/server";
import { db, helpers } from "@/lib/fakeDb";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  const body = await req.json();

  const p = db.projects.find((x) => x.id === id && !x.deleted_at);

  if (!p) return NextResponse.json({ error: "not found" }, { status: 404 });

  if (body.name) p.name = body.name;

  return NextResponse.json({ project: p });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  const p = db.projects.find((x) => x.id === id && !x.deleted_at);

  if (!p) return NextResponse.json({ error: "not found" }, { status: 404 });

  helpers.softDelete(p);

  return NextResponse.json({ ok: true });
}
