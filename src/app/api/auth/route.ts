import { NextResponse } from "next/server";
import { db } from "@/lib/fakeDb";

export async function POST(req: Request) {
  const body = await req.json();

  const { email } = body || {};

  if (!email || typeof email !== "string")
    return NextResponse.json({ error: "email required" }, { status: 400 });

  const user = db.findOrCreateUserByEmail(email);

  return NextResponse.json({ user });
}
