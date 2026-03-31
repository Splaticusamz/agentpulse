import { NextRequest, NextResponse } from "next/server";
import { getClient, migrate } from "@/lib/db";
import { checkEndpoint } from "@/lib/checker";
import { fireWebhooks } from "@/lib/webhooks";
import { v4 as uuid } from "uuid";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = getClient();
  await migrate();
  const epResult = await client.execute("SELECT * FROM endpoints");
  const endpoints = epResult.rows;

  const results = await Promise.allSettled(
    endpoints.map(async (ep) => {
      const result = await checkEndpoint(ep.url as string, ep.type as string);
      await client.execute({
        sql: "INSERT INTO checks (id, endpoint_id, status, response_time, status_code, error, checked_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))",
        args: [uuid(), ep.id as string, result.status, result.responseTime, result.statusCode, result.error],
      });

      // Incident management
      const incResult = await client.execute({
        sql: "SELECT * FROM incidents WHERE endpoint_id = ? AND resolved_at IS NULL ORDER BY started_at DESC LIMIT 1",
        args: [ep.id as string],
      });
      const lastIncident = incResult.rows[0];

      if (result.status === "down" && !lastIncident) {
        const incId = uuid();
        await client.execute({
          sql: "INSERT INTO incidents (id, endpoint_id, type) VALUES (?, ?, 'downtime')",
          args: [incId, ep.id as string],
        });
        await fireWebhooks("incident.created", {
          event: "incident.created",
          endpoint: { name: ep.name as string, url: ep.url as string, slug: ep.slug as string },
          incident: { id: incId, started_at: new Date().toISOString(), type: "downtime" },
          timestamp: new Date().toISOString(),
        });
      } else if (result.status === "up" && lastIncident) {
        await client.execute({
          sql: "UPDATE incidents SET resolved_at = datetime('now') WHERE id = ?",
          args: [lastIncident.id as string],
        });
        await fireWebhooks("incident.resolved", {
          event: "incident.resolved",
          endpoint: { name: ep.name as string, url: ep.url as string, slug: ep.slug as string },
          incident: { id: lastIncident.id as string, started_at: "", resolved_at: new Date().toISOString(), type: "downtime" },
          timestamp: new Date().toISOString(),
        });
      }

      return { endpoint: ep.name, ...result };
    })
  );

  return NextResponse.json({ checked: results.length, results });
}

export async function GET(req: NextRequest) {
  return POST(req);
}
