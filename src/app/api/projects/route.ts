import { NextResponse } from "next/server";
import { db } from "@/lib/fakeDb";

export async function GET() {
  const projects = db.projects.filter((p) => !p.deleted_at);

  return NextResponse.json({ projects });
}

export async function POST(req: Request) {
  const body = await req.json();

  const { name, user_email } = body || {};

  if (!name)
    return NextResponse.json({ error: "name required" }, { status: 400 });

  if (!user_email)
    return NextResponse.json({ error: "user_email required" }, { status: 400 });

  const user = db.findOrCreateUserByEmail(user_email);

  const proj = {
    id: `proj_${Date.now()}`,
    name,
    created_by: user.id,
    created_at: new Date().toISOString(),
  };

  db.projects.push(proj);

  return NextResponse.json({ project: proj });
}
