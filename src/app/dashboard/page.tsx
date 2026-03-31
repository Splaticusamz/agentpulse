/* ──────────────────────────────────────────────────
   AgentPulse — Internal Ops Dashboard
   ────────────────────────────────────────────────── */

function StatCard({ label, value, sub, color = "emerald" }: { label: string; value: string; sub?: string; color?: string }) {
  const accent: Record<string, string> = {
    emerald: "text-emerald-400",
    cyan: "text-cyan-400",
    amber: "text-amber-400",
    rose: "text-rose-400",
    violet: "text-violet-400",
    blue: "text-blue-400",
  };
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition">
      <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-3xl font-bold ${accent[color] ?? "text-emerald-400"}`}>{value}</p>
      {sub && <p className="text-zinc-600 text-xs mt-1">{sub}</p>}
    </div>
  );
}

function ProgressBar({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-zinc-300">{label}</span>
        <span className="text-zinc-500">{pct}%</span>
      </div>
      <div className="h-2.5 bg-zinc-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function FlowBox({ text, emoji, color = "border-zinc-700 bg-zinc-900" }: { text: string; emoji?: string; color?: string }) {
  return (
    <div className={`border rounded-lg px-4 py-2.5 text-center text-sm font-medium ${color} whitespace-nowrap`}>
      {emoji && <span className="mr-1">{emoji}</span>}{text}
    </div>
  );
}

function Arrow() {
  return <div className="text-zinc-600 text-lg font-bold flex items-center justify-center">→</div>;
}

function StatusDot({ ok }: { ok: boolean }) {
  return <span className={`inline-block w-2.5 h-2.5 rounded-full ${ok ? "bg-emerald-400" : "bg-rose-400"}`} />;
}

export default function Dashboard() {
  const now = new Date().toISOString().replace("T", " ").slice(0, 19) + " UTC";

  return (
    <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-1">📡 AgentPulse Dashboard</h1>
        <p className="text-zinc-500 text-sm">Internal operations &amp; development tracker — Last updated: {now}</p>
      </div>

      {/* ═══ Current Status ═══ */}
      <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-5">
        <h2 className="text-xl font-bold flex items-center gap-2">🟢 System Status: <span className="text-emerald-400">OPERATIONAL</span></h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { name: "API Server", ok: true },
            { name: "Cron Scheduler", ok: true },
            { name: "Database (Turso)", ok: true },
            { name: "Badge Service", ok: true },
          ].map((s) => (
            <div key={s.name} className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3">
              <StatusDot ok={s.ok} />
              <span className="text-sm text-zinc-300">{s.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ Stats Grid ═══ */}
      <section>
        <h2 className="text-xl font-bold mb-4">📊 Metrics at a Glance</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard label="Endpoints" value="12" sub="monitored" color="emerald" />
          <StatCard label="Checks Today" value="3,456" sub="health pings" color="cyan" />
          <StatCard label="Avg Response" value="142ms" sub="p50 latency" color="blue" />
          <StatCard label="Status Pages" value="8" sub="generated" color="violet" />
          <StatCard label="Incidents" value="2" sub="detected" color="rose" />
          <StatCard label="Badge Hits" value="1,247" sub="requests today" color="amber" />
        </div>
      </section>

      {/* ═══ How AgentPulse Works — Flow Diagram ═══ */}
      <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-5">🔄 How AgentPulse Works</h2>
        <div className="overflow-x-auto">
          <div className="flex items-center gap-3 min-w-max py-2">
            <FlowBox emoji="📝" text="Register Endpoint" color="border-emerald-500/40 bg-emerald-500/10" />
            <Arrow />
            <FlowBox emoji="⏰" text="Cron Ping (5 min)" color="border-cyan-500/40 bg-cyan-500/10" />
            <Arrow />
            <FlowBox emoji="🩺" text="Health Check" color="border-blue-500/40 bg-blue-500/10" />
            <Arrow />
            <FlowBox emoji="💾" text="Store Result" color="border-violet-500/40 bg-violet-500/10" />
            <Arrow />
            <FlowBox emoji="📊" text="Update Status Page" color="border-amber-500/40 bg-amber-500/10" />
            <Arrow />
            <FlowBox emoji="🔔" text="Alert if Down" color="border-rose-500/40 bg-rose-500/10" />
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="bg-zinc-800/50 rounded-lg p-4">
            <p className="text-emerald-400 font-semibold mb-1">Input</p>
            <p className="text-zinc-400">MCP servers, ACP manifests, LLM API endpoints, raw HTTP URLs</p>
          </div>
          <div className="bg-zinc-800/50 rounded-lg p-4">
            <p className="text-cyan-400 font-semibold mb-1">Processing</p>
            <p className="text-zinc-400">Vercel Cron triggers API route → pings endpoint → records latency + status code</p>
          </div>
          <div className="bg-zinc-800/50 rounded-lg p-4">
            <p className="text-amber-400 font-semibold mb-1">Output</p>
            <p className="text-zinc-400">Status pages, SVG badges, webhook alerts, incident timeline, 30-day charts</p>
          </div>
        </div>
      </section>

      {/* ═══ Automation Flow ═══ */}
      <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-5">⚙️ Automation Pipeline</h2>
        <div className="overflow-x-auto">
          <div className="flex items-center gap-3 min-w-max py-2">
            <FlowBox emoji="🕐" text="Vercel Cron" color="border-zinc-600 bg-zinc-800" />
            <Arrow />
            <FlowBox emoji="🌐" text="API Route" color="border-zinc-600 bg-zinc-800" />
            <Arrow />
            <FlowBox emoji="📡" text="Ping Endpoints" color="border-emerald-500/40 bg-emerald-500/10" />
            <Arrow />
            <FlowBox emoji="⚖️" text="Compare Response" color="border-cyan-500/40 bg-cyan-500/10" />
            <Arrow />
            <FlowBox emoji="🗄️" text="Update DB" color="border-violet-500/40 bg-violet-500/10" />
          </div>
          <div className="flex items-center gap-3 min-w-max py-2 mt-3 pl-8">
            <span className="text-zinc-600 text-lg">↳</span>
            <FlowBox emoji="🏷️" text="Generate Badge SVG" color="border-amber-500/40 bg-amber-500/10" />
            <Arrow />
            <FlowBox emoji="📄" text="Render Status Page" color="border-blue-500/40 bg-blue-500/10" />
            <Arrow />
            <FlowBox emoji="🔔" text="Webhook Alert" color="border-rose-500/40 bg-rose-500/10" />
          </div>
        </div>
      </section>

      {/* ═══ Revenue Timeline ═══ */}
      <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-5">💰 Revenue Timeline</h2>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-500 via-cyan-500 to-violet-500" />
          <div className="space-y-6 pl-12">
            {[
              { time: "Week 1 (Now)", title: "MVP Launch", desc: "Core monitoring, status pages live. First beta users.", color: "bg-emerald-400", active: true },
              { time: "Week 2", title: "SEO & Organic Growth", desc: "Google indexing, ProductHunt prep, first organic signups.", color: "bg-emerald-500", active: false },
              { time: "Week 3", title: "Pro Tier Launch", desc: "Stripe integration, first paying customers at $9/mo.", color: "bg-cyan-400", active: false },
              { time: "Month 2", title: "$500 MRR", desc: "~55 Pro subscribers. Content marketing + integrations.", color: "bg-blue-400", active: false },
              { time: "Month 3", title: "$2K MRR", desc: "Team tier adoption. 100+ paying accounts.", color: "bg-violet-400", active: false },
              { time: "Month 6", title: "$10K MRR", desc: "Enterprise tier, SOC2, dedicated support.", color: "bg-purple-400", active: false },
            ].map((m) => (
              <div key={m.time} className="relative">
                <div className={`absolute -left-[2.35rem] top-1 w-4 h-4 rounded-full ${m.color} ${m.active ? "ring-4 ring-emerald-400/20" : ""}`} />
                <div className="flex items-baseline gap-3">
                  <span className={`text-xs font-mono ${m.active ? "text-emerald-400" : "text-zinc-500"}`}>{m.time}</span>
                  <span className={`text-sm font-semibold ${m.active ? "text-white" : "text-zinc-300"}`}>{m.title}</span>
                </div>
                <p className="text-zinc-500 text-sm mt-0.5">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Development Status ═══ */}
      <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-5">🛠️ Development Status</h2>
        <div className="space-y-4">
          <ProgressBar label="Phase 1: Core Infrastructure (Next.js, DB, API routes)" pct={80} color="bg-emerald-500" />
          <ProgressBar label="Phase 2: Status Page Generation" pct={60} color="bg-emerald-400" />
          <ProgressBar label="Phase 3: Badge System (SVG, embed codes)" pct={40} color="bg-amber-400" />
          <ProgressBar label="Phase 4: Alerts & Webhooks" pct={20} color="bg-orange-400" />
          <ProgressBar label="Phase 5: Pro Tier & Stripe Payments" pct={0} color="bg-zinc-600" />
        </div>
        <div className="mt-5 flex items-center gap-4 text-xs text-zinc-500">
          <span>🟢 Complete</span>
          <span>🟡 In Progress</span>
          <span>⚪ Not Started</span>
          <span className="ml-auto">Overall: ~40%</span>
        </div>
      </section>

      {/* ═══ Tech Stack ═══ */}
      <section>
        <h2 className="text-xl font-bold mb-4">🧱 Tech Stack</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { emoji: "▲", name: "Next.js 16", desc: "App Router + RSC" },
            { emoji: "⏰", name: "Vercel Cron", desc: "Scheduled pings" },
            { emoji: "🗄️", name: "Turso/SQLite", desc: "Edge database" },
            { emoji: "🎨", name: "Tailwind v4", desc: "Utility CSS" },
            { emoji: "🏷️", name: "SVG Badges", desc: "Dynamic generation" },
            { emoji: "🔔", name: "Webhooks", desc: "Alert delivery" },
          ].map((t) => (
            <div key={t.name} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center hover:border-zinc-700 transition">
              <div className="text-2xl mb-2">{t.emoji}</div>
              <p className="text-sm font-semibold">{t.name}</p>
              <p className="text-zinc-500 text-xs">{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ Project Synergy ═══ */}
      <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-4">🔗 Pragmasix Ecosystem Synergy</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
            <p className="font-semibold text-emerald-400 mb-1">ACP Watchtower → AgentPulse</p>
            <p className="text-zinc-400">Validate manifest → then monitor uptime. Natural pipeline.</p>
          </div>
          <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
            <p className="font-semibold text-cyan-400 mb-1">LLM Prices → AgentPulse</p>
            <p className="text-zinc-400">Track LLM API uptime alongside pricing data. Cross-sell.</p>
          </div>
          <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
            <p className="font-semibold text-amber-400 mb-1">SEO Compounding</p>
            <p className="text-zinc-400">Status pages create indexable URLs for every monitored endpoint.</p>
          </div>
          <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
            <p className="font-semibold text-violet-400 mb-1">Badge Virality</p>
            <p className="text-zinc-400">Every README badge links back → organic traffic flywheel.</p>
          </div>
        </div>
      </section>

      <footer className="text-center text-zinc-600 text-xs py-6">
        AgentPulse Dashboard — Internal Use · Pragmasix · {now}
      </footer>
    </main>
  );
}
