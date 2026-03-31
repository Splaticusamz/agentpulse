import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { v4 as uuid } from "uuid";

export async function GET() {
  const db = getDb();
  const rows = db.prepare("SELECT * FROM webhooks ORDER BY created_at DESC").all();
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const { url, endpoint_id, events } = await req.json();
  if (!url) return NextResponse.json({ error: "url required" }, { status: 400 });
  const db = getDb();
  const id = uuid();
  db.prepare("INSERT INTO webhooks (id, endpoint_id, url, events) VALUES (?, ?, ?, ?)").run(
    id,
    endpoint_id || null,
    url,
    events || "incident.created,incident.resolved"
  );
  return NextResponse.json({ id, url, endpoint_id, events }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const db = getDb();
  db.prepare("DELETE FROM webhooks WHERE id = ?").run(id);
  return NextResponse.json({ deleted: true });
}
