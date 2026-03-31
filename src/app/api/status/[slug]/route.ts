import { NextRequest, NextResponse } from "next/server";
import { getClient, migrate } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const client = getClient();
  await migrate();

  const epResult = await client.execute({ sql: "SELECT * FROM endpoints WHERE slug = ?", args: [slug] });
  const endpoint = epResult.rows[0];
  if (!endpoint) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const checksResult = await client.execute({
    sql: "SELECT * FROM checks WHERE endpoint_id = ? AND checked_at > datetime('now', '-24 hours') ORDER BY checked_at DESC",
    args: [endpoint.id as string],
  });
  const checks = checksResult.rows;
  const totalChecks = checks.length;
  const upChecks = checks.filter((c) => c.status === "up").length;
  const uptimePercent = totalChecks > 0 ? Math.round((upChecks / totalChecks) * 10000) / 100 : 100;

  const incResult = await client.execute({
    sql: "SELECT * FROM incidents WHERE endpoint_id = ? ORDER BY started_at DESC LIMIT 10",
    args: [endpoint.id as string],
  });

  const lastCheck = checks[0];

  return NextResponse.json({
    endpoint,
    status: (lastCheck?.status as string) ?? "unknown",
    uptimePercent,
    avgResponseTime: totalChecks > 0
      ? Math.round(checks.reduce((s, c) => s + ((c.response_time as number) || 0), 0) / totalChecks)
      : null,
    checks,
    incidents: incResult.rows,
  });
}
