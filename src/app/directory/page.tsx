export const metadata = {
  title: "AI Agent Directory — AgentPulse",
  description: "Browse monitored AI agents, MCP servers, ACP endpoints, and LLM APIs. Live uptime status for the AI agent ecosystem.",
};

interface Endpoint {
  id: string; name: string; url: string; type: string; slug: string; created_at: string;
}
interface StatusData {
  status: string; uptimePercent: number; avgResponseTime: number | null;
}

async function getEndpoints(): Promise<Array<Endpoint & StatusData>> {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  try {
    const res = await fetch(`${base}/api/endpoints`, { cache: "no-store" });
    if (!res.ok) return [];
    const endpoints = await res.json() as Endpoint[];
    
    const withStatus = await Promise.all(
      endpoints.map(async (ep) => {
        try {
          const sr = await fetch(`${base}/api/status/${ep.slug}`, { cache: "no-store" });
          if (!sr.ok) return { ...ep, status: "unknown", uptimePercent: 0, avgResponseTime: null };
          const data = await sr.json();
          return { ...ep, status: data.status, uptimePercent: data.uptimePercent, avgResponseTime: data.avgResponseTime };
        } catch {
          return { ...ep, status: "unknown", uptimePercent: 0, avgResponseTime: null };
        }
      })
    );
    return withStatus;
  } catch {
    return [];
  }
}

export default async function DirectoryPage() {
  const endpoints = await getEndpoints();
  const upCount = endpoints.filter((e) => e.status === "up").length;

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3">🌐 AI Agent Directory</h1>
          <p className="text-zinc-400 max-w-xl mx-auto">
            Live uptime status for AI agents, MCP servers, and LLM APIs monitored by AgentPulse.
          </p>
          <div className="flex justify-center gap-6 mt-6">
            <span className="text-sm text-zinc-500">{endpoints.length} endpoints</span>
            <span className="text-sm text-emerald-400">{upCount} online</span>
            <span className="text-sm text-red-400">{endpoints.length - upCount} issues</span>
          </div>
        </div>

        {endpoints.length === 0 ? (
          <div className="text-center py-20 text-zinc-500">
            <p className="text-lg mb-2">No endpoints monitored yet</p>
            <a href="/dashboard" className="text-emerald-400 hover:underline text-sm">Add your first endpoint →</a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {endpoints.map((ep) => {
              const color = ep.status === "up" ? "border-emerald-500/30 bg-emerald-500/5" : ep.status === "degraded" ? "border-amber-500/30 bg-amber-500/5" : "border-red-500/30 bg-red-500/5";
              const dot = ep.status === "up" ? "bg-emerald-500" : ep.status === "degraded" ? "bg-amber-500" : "bg-red-500";
              return (
                <a key={ep.id} href={`/status/${ep.slug}`} className={`block border rounded-xl p-5 hover:scale-[1.01] transition ${color}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`w-3 h-3 rounded-full ${dot} ${ep.status === "up" ? "animate-pulse" : ""}`} />
                    <h3 className="font-semibold text-lg">{ep.name}</h3>
                  </div>
                  <p className="text-xs text-zinc-500 font-mono truncate mb-3">{ep.url}</p>
                  <div className="flex gap-4 text-xs">
                    <span className="text-zinc-400"><span className="uppercase bg-zinc-800 px-1.5 py-0.5 rounded">{ep.type}</span></span>
                    <span className="text-emerald-400">{ep.uptimePercent}% uptime</span>
                    {ep.avgResponseTime && <span className="text-zinc-500">{ep.avgResponseTime}ms</span>}
                  </div>
                </a>
              );
            })}
          </div>
        )}

        <div className="mt-16 text-center">
          <p className="text-zinc-500 text-sm mb-4">Want your agent listed here?</p>
          <a href="/dashboard" className="inline-block bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-6 py-2.5 rounded-xl transition text-sm">
            Add Your Endpoint →
          </a>
        </div>
      </div>
    </main>
  );
}
