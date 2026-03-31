interface StatusData {
  endpoint: { name: string };
  status: string;
  uptimePercent: number;
  avgResponseTime: number | null;
  checks: Array<{ id: string; status: string; response_time: number; checked_at: string }>;
}

async function getStatus(slug: string): Promise<StatusData | null> {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  try {
    const res = await fetch(`${base}/api/status/${slug}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function EmbedPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getStatus(slug);

  if (!data) {
    return (
      <div className="bg-zinc-900 text-zinc-400 p-4 rounded-lg text-center text-sm">
        Endpoint not found
      </div>
    );
  }

  const { endpoint, status, uptimePercent, avgResponseTime, checks } = data;
  const dot = status === "up" ? "bg-emerald-500" : status === "degraded" ? "bg-amber-500" : "bg-red-500";
  const recent = checks.slice(0, 30).reverse();

  return (
    <html>
      <body style={{ margin: 0, padding: 0, background: "transparent", fontFamily: "system-ui, sans-serif" }}>
        <div style={{
          background: "#18181b", border: "1px solid #27272a", borderRadius: "12px",
          padding: "16px", color: "#fafafa", maxWidth: "400px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <span style={{
              width: "10px", height: "10px", borderRadius: "50%",
              background: status === "up" ? "#10b981" : status === "degraded" ? "#f59e0b" : "#ef4444",
              display: "inline-block",
            }} />
            <span style={{ fontWeight: 600, fontSize: "14px" }}>{endpoint.name}</span>
            <span style={{ marginLeft: "auto", fontSize: "12px", color: "#71717a" }}>
              {uptimePercent}% · {avgResponseTime ? `${avgResponseTime}ms` : "N/A"}
            </span>
          </div>
          <div style={{ display: "flex", gap: "1px", height: "20px" }}>
            {recent.map((c) => (
              <div
                key={c.id}
                style={{
                  flex: 1, borderRadius: "2px",
                  background: c.status === "up" ? "#10b981" : c.status === "degraded" ? "#f59e0b" : "#ef4444",
                }}
                title={`${c.checked_at}: ${c.status}`}
              />
            ))}
          </div>
          <div style={{ textAlign: "right", marginTop: "8px" }}>
            <a href={`https://agentpulse-woad.vercel.app/status/${slug}`}
               target="_blank" rel="noopener" style={{ color: "#10b981", fontSize: "11px", textDecoration: "none" }}>
              Powered by AgentPulse ↗
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
