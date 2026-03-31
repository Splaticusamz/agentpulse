import { notFound } from "next/navigation";

interface Check { id: string; status: string; response_time: number; checked_at: string; }
interface Incident { id: string; started_at: string; resolved_at: string | null; type: string; }

async function getStatus(slug: string) {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${base}/api/status/${slug}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export default async function StatusPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getStatus(slug);
  if (!data) notFound();

  const { endpoint, status, uptimePercent, avgResponseTime, checks, incidents } = data;
  const statusColor = status === "up" ? "bg-emerald-500" : status === "degraded" ? "bg-amber-500" : "bg-red-500";

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className={`w-4 h-4 rounded-full ${statusColor} animate-pulse`} />
        <h1 className="text-3xl font-bold">{endpoint.name}</h1>
        <span className="text-zinc-500 text-sm ml-auto">{endpoint.url}</span>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatBox label="Status" value={status.toUpperCase()} color={statusColor} />
        <StatBox label="Uptime (24h)" value={`${uptimePercent}%`} />
        <StatBox label="Avg Response" value={avgResponseTime ? `${avgResponseTime}ms` : "N/A"} />
      </div>

      <h2 className="text-xl font-semibold mb-4">Recent Checks</h2>
      <div className="flex gap-0.5 mb-8 h-8">
        {(checks as Check[]).slice(0, 96).reverse().map((c: Check) => (
          <div
            key={c.id}
            className={`flex-1 rounded-sm ${c.status === "up" ? "bg-emerald-500" : c.status === "degraded" ? "bg-amber-500" : "bg-red-500"}`}
            title={`${c.checked_at}: ${c.status} (${c.response_time}ms)`}
          />
        ))}
      </div>

      {(incidents as Incident[]).length > 0 && (
        <>
          <h2 className="text-xl font-semibold mb-4">Incidents</h2>
          <div className="space-y-2">
            {(incidents as Incident[]).map((inc: Incident) => (
              <div key={inc.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                <div className="flex justify-between">
                  <span className="text-red-400 font-medium">{inc.type}</span>
                  <span className="text-zinc-500 text-sm">{inc.started_at}</span>
                </div>
                {inc.resolved_at ? (
                  <p className="text-emerald-400 text-sm mt-1">Resolved at {inc.resolved_at}</p>
                ) : (
                  <p className="text-amber-400 text-sm mt-1">Ongoing</p>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      <div className="mt-8 text-center text-zinc-600 text-sm">
        Powered by <a href="/" className="text-emerald-400 hover:underline">AgentPulse</a>
      </div>
    </main>
  );
}

function StatBox({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <p className="text-zinc-500 text-xs uppercase tracking-wider">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${color ? "text-white" : "text-emerald-400"}`}>{value}</p>
    </div>
  );
}
