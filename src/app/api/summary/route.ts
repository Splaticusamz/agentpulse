import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const db = getDb();
  const total = (db.prepare("SELECT COUNT(*) as c FROM endpoints").get() as { c: number }).c;
  const activeIncidents = (db.prepare("SELECT COUNT(*) as c FROM incidents WHERE resolved_at IS NULL").get() as { c: number }).c;
  
  // Get status breakdown from recent checks
  const statusCounts = db.prepare(`
    SELECT e.id, e.name, e.slug, 
      (SELECT status FROM checks WHERE endpoint_id = e.id ORDER BY checked_at DESC LIMIT 1) as current_status
    FROM endpoints e
  `).all() as Array<{ id: string; name: string; slug: string; current_status: string | null }>;
  
  const up = statusCounts.filter(s => s.current_status === "up").length;
  const degraded = statusCounts.filter(s => s.current_status === "degraded").length;
  const down = statusCounts.filter(s => s.current_status === "down").length;

  const overall = down > 0 ? "partial_outage" : degraded > 0 ? "degraded" : "operational";

  return NextResponse.json({
    status: overall,
    endpoints: { total, up, degraded, down, unknown: total - up - degraded - down },
    active_incidents: activeIncidents,
    updated_at: new Date().toISOString(),
  });
}
