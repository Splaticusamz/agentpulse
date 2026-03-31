import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { v4 as uuid } from "uuid";

export async function GET() {
  const db = getDb();
  const rows = db.prepare("SELECT * FROM endpoints ORDER BY created_at DESC").all();
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, url, type = "http", slug } = body;
  if (!name || !url || !slug) {
    return NextResponse.json({ error: "name, url, slug required" }, { status: 400 });
  }
  const db = getDb();
  const id = uuid();
  try {
    db.prepare("INSERT INTO endpoints (id, name, url, type, slug) VALUES (?, ?, ?, ?, ?)").run(id, name, url, type, slug);
    return NextResponse.json({ id, name, url, type, slug }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("UNIQUE")) return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
