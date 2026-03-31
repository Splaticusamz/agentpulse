import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { checkEndpoint } from "@/lib/checker";
import { v4 as uuid } from "uuid";

export async function POST(req: NextRequest) {
  const { endpoint_id } = await req.json();
  if (!endpoint_id) return NextResponse.json({ error: "endpoint_id required" }, { status: 400 });

  const db = getDb();
  const ep = db.prepare("SELECT * FROM endpoints WHERE id = ?").get(endpoint_id) as {
    id: string; url: string; type: string; name: string;
  } | undefined;
  if (!ep) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const result = await checkEndpoint(ep.url, ep.type);
  db.prepare(
    "INSERT INTO checks (id, endpoint_id, status, response_time, status_code, error, checked_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))"
  ).run(uuid(), ep.id, result.status, result.responseTime, result.statusCode, result.error);

  return NextResponse.json({ endpoint: ep.name, ...result });
}
