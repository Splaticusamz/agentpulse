import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = getDb();

  const endpoint = db.prepare("SELECT * FROM endpoints WHERE slug = ?").get(slug) as Record<string, unknown> | undefined;
  if (!endpoint) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const checks = db.prepare(
    "SELECT * FROM checks WHERE endpoint_id = ? AND checked_at > datetime('now', '-24 hours') ORDER BY checked_at DESC"
  ).all(endpoint.id as string);

  const checksTyped = checks as Array<{ status: string; response_time: number }>;
  const totalChecks = checksTyped.length;
  const upChecks = checksTyped.filter((c) => c.status === "up").length;
  const uptimePercent = totalChecks > 0 ? Math.round((upChecks / totalChecks) * 10000) / 100 : 100;

  const incidents = db.prepare(
    "SELECT * FROM incidents WHERE endpoint_id = ? ORDER BY started_at DESC LIMIT 10"
  ).all(endpoint.id as string);

  const lastCheck = checksTyped[0];

  return NextResponse.json({
    endpoint,
    status: lastCheck?.status ?? "unknown",
    uptimePercent,
    avgResponseTime: totalChecks > 0
      ? Math.round(checksTyped.reduce((s, c) => s + (c.response_time || 0), 0) / totalChecks)
      : null,
    checks,
    incidents,
  });
}
