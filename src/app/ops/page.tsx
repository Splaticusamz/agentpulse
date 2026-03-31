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

export default function OpsPage() {
  const now = new Date().toISOString().replace("T", " ").slice(0, 19) + " UTC";

  return (
    <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div>
        <h1 className="text-3xl font-bold mb-1">📡 AgentPulse — Ops Dashboard</h1>
        <p className="text-zinc-500 text-sm">Internal development tracker — Last updated: {now}</p>
      </div>

      <section>
        <h2 className="text-xl font-bold mb-4">📊 Project Metrics</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard label="Commits" value="7" sub="total" color="emerald" />
          <StatCard label="API Routes" value="8" sub="endpoints" color="cyan" />
          <StatCard label="Pages" value="4" sub="routes" color="blue" />
          <StatCard label="Features" value="12" sub="shipped" color="violet" />
          <StatCard label="Build" value="✓" sub="passing" color="emerald" />
          <StatCard label="Night" value="5" sub="hustle streak" color="amber" />
        </div>
      </section>

      <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-5">🛠️ Development Status</h2>
        <div className="space-y-4">
          <ProgressBar label="Phase 1: Core Infrastructure (Next.js, SQLite, API routes)" pct={100} color="bg-emerald-500" />
          <ProgressBar label="Phase 2: Health Check Engine (HTTP/MCP/ACP)" pct={100} color="bg-emerald-500" />
          <ProgressBar label="Phase 3: Status Page Generation (/status/[slug])" pct={100} color="bg-emerald-500" />
          <ProgressBar label="Phase 4: Badge System (SVG uptime badges)" pct={100} color="bg-emerald-500" />
          <ProgressBar label="Phase 5: Vercel Cron (5-min automated checks)" pct={100} color="bg-emerald-500" />
          <ProgressBar label="Phase 6: Incident Detection & Resolution" pct={100} color="bg-emerald-500" />
          <ProgressBar label="Phase 7: Webhook Alerts System" pct={100} color="bg-emerald-500" />
          <ProgressBar label="Phase 8: Interactive Dashboard (CRUD + Live Status)" pct={100} color="bg-emerald-500" />
          <ProgressBar label="Phase 9: Response Time Sparklines" pct={100} color="bg-emerald-500" />
          <ProgressBar label="Phase 10: Waitlist & Pricing" pct={100} color="bg-emerald-500" />
          <ProgressBar label="Phase 11: Demo Seed Data" pct={100} color="bg-emerald-500" />
          <ProgressBar label="Phase 12: Stripe Payments" pct={0} color="bg-zinc-600" />
        </div>
        <div className="mt-5 flex items-center gap-4 text-xs text-zinc-500">
          <span>🟢 Complete</span>
          <span>⚪ Not Started</span>
          <span className="ml-auto">Overall: ~92%</span>
        </div>
      </section>

      <footer className="text-center text-zinc-600 text-xs py-6">
        AgentPulse Ops — Pragmasix · {now}
      </footer>
    </main>
  );
}
