"use client";

import { useState, useEffect, useCallback } from "react";

interface Endpoint {
  id: string;
  name: string;
  url: string;
  type: string;
  slug: string;
  created_at: string;
}

interface EndpointWithStatus extends Endpoint {
  status?: string;
  uptime?: number;
  avgResponse?: number;
  lastCheck?: string;
  checking?: boolean;
}

interface Webhook {
  id: string;
  url: string;
  endpoint_id: string | null;
  events: string;
}

export default function Dashboard() {
  const [endpoints, setEndpoints] = useState<EndpointWithStatus[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [waitlistCount, setWaitlistCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showWebhook, setShowWebhook] = useState(false);
  const [form, setForm] = useState({ name: "", url: "", type: "http" });
  const [whForm, setWhForm] = useState({ url: "", endpoint_id: "", events: "incident.created,incident.resolved" });
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    try {
      const [epRes, whRes, wlRes] = await Promise.all([
        fetch("/api/endpoints"),
        fetch("/api/webhooks"),
        fetch("/api/waitlist"),
      ]);
      const eps = await epRes.json();
      const whs = await whRes.json();
      const wl = await wlRes.json();
      
      // Load status for each endpoint
      const withStatus = await Promise.all(
        (eps as Endpoint[]).map(async (ep) => {
          try {
            const statusRes = await fetch(`/api/status/${ep.slug}`);
            if (!statusRes.ok) return { ...ep };
            const data = await statusRes.json();
            return {
              ...ep,
              status: data.status,
              uptime: data.uptimePercent,
              avgResponse: data.avgResponseTime,
              lastCheck: data.checks?.[0]?.checked_at,
            };
          } catch {
            return { ...ep };
          }
        })
      );
      
      setEndpoints(withStatus);
      setWebhooks(whs);
      setWaitlistCount(wl.count);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const addEndpoint = async () => {
    setError("");
    if (!form.name || !form.url) { setError("Name and URL required"); return; }
    const slug = form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const res = await fetch("/api/endpoints", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, slug }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed");
      return;
    }
    setForm({ name: "", url: "", type: "http" });
    setShowAdd(false);
    loadData();
  };

  const deleteEndpoint = async (id: string) => {
    await fetch(`/api/endpoints/${id}`, { method: "DELETE" });
    loadData();
  };

  const checkNow = async (ep: EndpointWithStatus) => {
    setEndpoints((prev) => prev.map((e) => (e.id === ep.id ? { ...e, checking: true } : e)));
    await fetch("/api/endpoints/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint_id: ep.id }),
    });
    await loadData();
  };

  const addWebhook = async () => {
    if (!whForm.url) return;
    await fetch("/api/webhooks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: whForm.url, endpoint_id: whForm.endpoint_id || null, events: whForm.events }),
    });
    setWhForm({ url: "", endpoint_id: "", events: "incident.created,incident.resolved" });
    setShowWebhook(false);
    loadData();
  };

  const deleteWebhook = async (id: string) => {
    await fetch("/api/webhooks", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    loadData();
  };

  const seedDemo = async () => {
    await fetch("/api/seed", { method: "POST" });
    loadData();
  };

  const statusColor = (s?: string) =>
    s === "up" ? "bg-emerald-500" : s === "degraded" ? "bg-amber-500" : s === "down" ? "bg-red-500" : "bg-zinc-600";
  const statusText = (s?: string) =>
    s === "up" ? "text-emerald-400" : s === "degraded" ? "text-amber-400" : s === "down" ? "text-red-400" : "text-zinc-500";

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="text-zinc-500 text-lg">Loading dashboard...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">📡 AgentPulse Dashboard</h1>
            <p className="text-zinc-500 text-sm mt-1">Monitor your AI agent endpoints</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowWebhook(!showWebhook)} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-sm transition">
              🔔 Webhooks ({webhooks.length})
            </button>
            <button onClick={() => setShowAdd(!showAdd)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-medium transition">
              + Add Endpoint
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Endpoints" value={String(endpoints.length)} color="emerald" />
          <StatCard label="Online" value={String(endpoints.filter((e) => e.status === "up").length)} color="cyan" />
          <StatCard label="Incidents" value={String(endpoints.filter((e) => e.status === "down").length)} color="rose" />
          <StatCard label="Waitlist" value={String(waitlistCount)} color="violet" />
        </div>

        {/* Add Endpoint Form */}
        {showAdd && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
            <h3 className="font-semibold text-lg">Add Endpoint</h3>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input
                placeholder="Name (e.g. OpenAI API)"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
              />
              <input
                placeholder="URL (e.g. https://api.openai.com)"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
              />
              <div className="flex gap-3">
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 flex-1"
                >
                  <option value="http">HTTP</option>
                  <option value="mcp">MCP (SSE)</option>
                  <option value="acp">ACP (Manifest)</option>
                </select>
                <button onClick={addEndpoint} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-medium transition whitespace-nowrap">
                  Add
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Webhook Form */}
        {showWebhook && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
            <h3 className="font-semibold text-lg">🔔 Webhook Alerts</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input
                placeholder="Webhook URL"
                value={whForm.url}
                onChange={(e) => setWhForm({ ...whForm, url: e.target.value })}
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
              />
              <select
                value={whForm.endpoint_id}
                onChange={(e) => setWhForm({ ...whForm, endpoint_id: e.target.value })}
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
              >
                <option value="">All Endpoints (global)</option>
                {endpoints.map((ep) => (
                  <option key={ep.id} value={ep.id}>{ep.name}</option>
                ))}
              </select>
              <button onClick={addWebhook} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-medium transition">
                Add Webhook
              </button>
            </div>
            {webhooks.length > 0 && (
              <div className="space-y-2 mt-4">
                {webhooks.map((wh) => (
                  <div key={wh.id} className="flex items-center justify-between bg-zinc-800/50 rounded-lg px-4 py-3">
                    <div>
                      <span className="text-sm text-zinc-300 font-mono">{wh.url}</span>
                      <span className="text-xs text-zinc-500 ml-3">{wh.endpoint_id ? "Specific" : "Global"}</span>
                    </div>
                    <button onClick={() => deleteWebhook(wh.id)} className="text-red-400 hover:text-red-300 text-sm">Delete</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Endpoints Table */}
        {endpoints.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
            <p className="text-zinc-500 text-lg mb-4">No endpoints yet</p>
            <button onClick={seedDemo} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-medium transition">
              🌱 Seed Demo Endpoints
            </button>
          </div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto_auto] gap-4 px-6 py-3 border-b border-zinc-800 text-xs text-zinc-500 uppercase tracking-wider">
              <div>Status</div>
              <div>Endpoint</div>
              <div>Type</div>
              <div>Uptime</div>
              <div>Response</div>
              <div>Last Check</div>
              <div>Actions</div>
            </div>
            {endpoints.map((ep) => (
              <div key={ep.id} className="grid grid-cols-[auto_1fr_auto_auto_auto_auto_auto] gap-4 px-6 py-4 border-b border-zinc-800/50 items-center hover:bg-zinc-800/30 transition">
                <div><span className={`inline-block w-3 h-3 rounded-full ${statusColor(ep.status)} ${ep.status === "up" ? "animate-pulse" : ""}`} /></div>
                <div>
                  <a href={`/status/${ep.slug}`} className="text-sm font-medium text-zinc-200 hover:text-emerald-400 transition">
                    {ep.name}
                  </a>
                  <p className="text-xs text-zinc-600 font-mono truncate max-w-xs">{ep.url}</p>
                </div>
                <div><span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded uppercase">{ep.type}</span></div>
                <div className={`text-sm font-mono ${ep.uptime !== undefined && ep.uptime >= 99 ? "text-emerald-400" : ep.uptime !== undefined && ep.uptime >= 95 ? "text-amber-400" : ep.uptime !== undefined ? "text-red-400" : "text-zinc-600"}`}>
                  {ep.uptime !== undefined ? `${ep.uptime}%` : "—"}
                </div>
                <div className="text-sm font-mono text-zinc-400">
                  {ep.avgResponse ? `${ep.avgResponse}ms` : "—"}
                </div>
                <div className="text-xs text-zinc-500">
                  {ep.lastCheck ? new Date(ep.lastCheck + "Z").toLocaleTimeString() : "Never"}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => checkNow(ep)}
                    disabled={ep.checking}
                    className="text-xs px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg transition disabled:opacity-50"
                  >
                    {ep.checking ? "⏳" : "🩺"} Check
                  </button>
                  <button
                    onClick={() => deleteEndpoint(ep.id)}
                    className="text-xs px-3 py-1.5 bg-zinc-800 hover:bg-red-900/50 border border-zinc-700 hover:border-red-800 rounded-lg transition text-red-400"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Seed button if endpoints exist */}
        {endpoints.length > 0 && endpoints.length < 5 && (
          <div className="text-center">
            <button onClick={seedDemo} className="text-sm text-zinc-500 hover:text-zinc-300 transition">
              🌱 Add demo endpoints
            </button>
          </div>
        )}

        <footer className="text-center text-zinc-600 text-xs py-6">
          AgentPulse · <a href="/" className="hover:text-emerald-400 transition">Home</a> · <a href="/dashboard" className="hover:text-emerald-400 transition">Dashboard</a>
        </footer>
      </div>
    </main>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  const accent: Record<string, string> = {
    emerald: "text-emerald-400",
    cyan: "text-cyan-400",
    rose: "text-rose-400",
    violet: "text-violet-400",
  };
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-3xl font-bold ${accent[color] || "text-emerald-400"}`}>{value}</p>
    </div>
  );
}
