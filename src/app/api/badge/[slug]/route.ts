import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = getDb();

  const endpoint = db.prepare("SELECT * FROM endpoints WHERE slug = ?").get(slug) as Record<string, unknown> | undefined;
  if (!endpoint) {
    return new NextResponse(makeBadge("unknown", "#999"), { headers: svgHeaders() });
  }

  const checks = db.prepare(
    "SELECT status FROM checks WHERE endpoint_id = ? AND checked_at > datetime('now', '-24 hours')"
  ).all(endpoint.id as string) as Array<{ status: string }>;

  const total = checks.length;
  const up = checks.filter((c) => c.status === "up").length;
  const pct = total > 0 ? Math.round((up / total) * 10000) / 100 : 100;

  const color = pct >= 99 ? "#22c55e" : pct >= 95 ? "#eab308" : "#ef4444";
  return new NextResponse(makeBadge(`${pct}%`, color), { headers: svgHeaders() });
}

function svgHeaders() {
  return {
    "Content-Type": "image/svg+xml",
    "Cache-Control": "public, max-age=300, s-maxage=300",
  };
}

function makeBadge(text: string, color: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="140" height="20" role="img" aria-label="uptime: ${text}">
  <linearGradient id="s" x2="0" y2="100%"><stop offset="0" stop-color="#bbb" stop-opacity=".1"/><stop offset="1" stop-opacity=".1"/></linearGradient>
  <clipPath id="r"><rect width="140" height="20" rx="3" fill="#fff"/></clipPath>
  <g clip-path="url(#r)">
    <rect width="62" height="20" fill="#555"/>
    <rect x="62" width="78" height="20" fill="${color}"/>
    <rect width="140" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="110" text-rendering="geometricPrecision">
    <text x="320" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="520">uptime</text>
    <text x="320" y="140" transform="scale(.1)" textLength="520">uptime</text>
    <text x="1000" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="680">${text}</text>
    <text x="1000" y="140" transform="scale(.1)" textLength="680">${text}</text>
  </g>
</svg>`;
}
