import { NextResponse } from "next/server";
import { getClient, migrate } from "@/lib/db";

export async function GET() {
  const client = getClient();
  await migrate();
  
  const totalResult = await client.execute("SELECT COUNT(*) as c FROM endpoints");
  const total = Number(totalResult.rows[0]?.c ?? 0);
  
  const activeResult = await client.execute("SELECT COUNT(*) as c FROM incidents WHERE resolved_at IS NULL");
  const activeIncidents = Number(activeResult.rows[0]?.c ?? 0);
  
  const statusResult = await client.execute(`
    SELECT e.id, e.name, e.slug, 
      (SELECT status FROM checks WHERE endpoint_id = e.id ORDER BY checked_at DESC LIMIT 1) as current_status
    FROM endpoints e
  `);
  
  const up = statusResult.rows.filter(s => s.current_status === "up").length;
  const degraded = statusResult.rows.filter(s => s.current_status === "degraded").length;
  const down = statusResult.rows.filter(s => s.current_status === "down").length;

  const overall = down > 0 ? "partial_outage" : degraded > 0 ? "degraded" : "operational";

  return NextResponse.json({
    status: overall,
    endpoints: { total, up, degraded, down, unknown: total - up - degraded - down },
    active_incidents: activeIncidents,
    updated_at: new Date().toISOString(),
  });
}
