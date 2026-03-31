import { NextRequest, NextResponse } from "next/server";
import { getClient, migrate } from "@/lib/db";
import { v4 as uuid } from "uuid";

export async function GET() {
  const client = getClient();
  await migrate();
  const result = await client.execute("SELECT * FROM webhooks ORDER BY created_at DESC");
  return NextResponse.json(result.rows);
}

export async function POST(req: NextRequest) {
  const { url, endpoint_id, events } = await req.json();
  if (!url) return NextResponse.json({ error: "url required" }, { status: 400 });
  const client = getClient();
  await migrate();
  const id = uuid();
  await client.execute({
    sql: "INSERT INTO webhooks (id, endpoint_id, url, events) VALUES (?, ?, ?, ?)",
    args: [id, endpoint_id || null, url, events || "incident.created,incident.resolved"],
  });
  return NextResponse.json({ id, url, endpoint_id, events }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const client = getClient();
  await migrate();
  await client.execute({ sql: "DELETE FROM webhooks WHERE id = ?", args: [id] });
  return NextResponse.json({ deleted: true });
}
