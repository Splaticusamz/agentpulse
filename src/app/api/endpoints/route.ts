import { NextRequest, NextResponse } from "next/server";
import { getClient, migrate } from "@/lib/db";
import { v4 as uuid } from "uuid";

export async function GET() {
  const client = getClient();
  await migrate();
  const result = await client.execute("SELECT * FROM endpoints ORDER BY created_at DESC");
  return NextResponse.json(result.rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, url, type = "http", slug } = body;
  if (!name || !url || !slug) {
    return NextResponse.json({ error: "name, url, slug required" }, { status: 400 });
  }
  const client = getClient();
  await migrate();
  const id = uuid();
  try {
    await client.execute({ sql: "INSERT INTO endpoints (id, name, url, type, slug) VALUES (?, ?, ?, ?, ?)", args: [id, name, url, type, slug] });
    return NextResponse.json({ id, name, url, type, slug }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("UNIQUE")) return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
