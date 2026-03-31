import { NextRequest, NextResponse } from "next/server";
import { getClient, migrate } from "@/lib/db";
import { checkEndpoint } from "@/lib/checker";
import { v4 as uuid } from "uuid";

export async function POST(req: NextRequest) {
  const { endpoint_id } = await req.json();
  if (!endpoint_id) return NextResponse.json({ error: "endpoint_id required" }, { status: 400 });

  const client = getClient();
  await migrate();
  const epResult = await client.execute({ sql: "SELECT * FROM endpoints WHERE id = ?", args: [endpoint_id] });
  const ep = epResult.rows[0];
  if (!ep) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const result = await checkEndpoint(ep.url as string, ep.type as string);
  await client.execute({
    sql: "INSERT INTO checks (id, endpoint_id, status, response_time, status_code, error, checked_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))",
    args: [uuid(), endpoint_id, result.status, result.responseTime, result.statusCode, result.error],
  });

  return NextResponse.json({ endpoint: ep.name, ...result });
}
