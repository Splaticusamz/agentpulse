import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { checkEndpoint } from "@/lib/checker";
import { v4 as uuid } from "uuid";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  // Verify cron secret in production
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const endpoints = db.prepare("SELECT * FROM endpoints").all() as Array<{
    id: string; url: string; type: string; name: string;
  }>;

  const results = await Promise.allSettled(
    endpoints.map(async (ep) => {
      const result = await checkEndpoint(ep.url, ep.type);
      const checkId = uuid();
      db.prepare(
        "INSERT INTO checks (id, endpoint_id, status, response_time, status_code, error, checked_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))"
      ).run(checkId, ep.id, result.status, result.responseTime, result.statusCode, result.error);

      // Incident management
      const lastIncident = db.prepare(
        "SELECT * FROM incidents WHERE endpoint_id = ? AND resolved_at IS NULL ORDER BY started_at DESC LIMIT 1"
      ).get(ep.id) as { id: string } | undefined;

      if (result.status === "down" && !lastIncident) {
        db.prepare("INSERT INTO incidents (id, endpoint_id, type) VALUES (?, ?, 'downtime')").run(uuid(), ep.id);
      } else if (result.status === "up" && lastIncident) {
        db.prepare("UPDATE incidents SET resolved_at = datetime('now') WHERE id = ?").run(lastIncident.id);
      }

      return { endpoint: ep.name, ...result };
    })
  );

  return NextResponse.json({ checked: results.length, results });
}

// Also allow GET for Vercel cron
export async function GET(req: NextRequest) {
  return POST(req);
}
