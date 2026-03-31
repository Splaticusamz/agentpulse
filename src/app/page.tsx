import Link from "next/link";

const features = [
  { icon: "🔍", title: "Endpoint Monitoring", desc: "Ping MCP servers, ACP manifests, and LLM APIs every 5 minutes automatically." },
  { icon: "📊", title: "Public Status Pages", desc: "Beautiful, auto-generated status pages for your AI agent infrastructure." },
  { icon: "🏷️", title: "Uptime Badges", desc: "SVG badges for your README — show the world your agents are online." },
  { icon: "🔔", title: "Instant Alerts", desc: "Webhook and email alerts the moment an endpoint goes down." },
  { icon: "📈", title: "Response Analytics", desc: "Track response times, uptime %, and incident history over 30 days." },
  { icon: "🌐", title: "Multi-Protocol", desc: "Supports HTTP, MCP stdio/SSE, ACP manifest validation, and raw TCP." },
];

const tiers = [
  { name: "Free", price: "$0", period: "/forever", endpoints: "3 endpoints", checks: "5-min checks", features: ["Public status page", "Uptime badges", "7-day history"], cta: "Start Free", highlight: false },
  { name: "Pro", price: "$9", period: "/month", endpoints: "25 endpoints", checks: "1-min checks", features: ["Private status pages", "Email & webhook alerts", "30-day history", "Custom domains"], cta: "Go Pro", highlight: true },
  { name: "Team", price: "$19", period: "/month", endpoints: "100 endpoints", checks: "30-sec checks", features: ["Everything in Pro", "Multi-region checks", "API access", "Webhooks & integrations", "Team members"], cta: "Start Team", highlight: false },
];

export default function Home() {
  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 via-transparent to-transparent" />
        <div className="max-w-5xl mx-auto px-6 pt-24 pb-20 text-center relative">
          <div className="inline-block mb-4 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-medium">
            🚀 Now in Public Beta
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            AI Agent Uptime<br />Monitor & Status Pages
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto mb-10">
            Monitor your MCP servers, ACP manifests, and LLM endpoints. Automated health checks, beautiful status pages, and instant alerts — built for the AI agent ecosystem.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/dashboard" className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-8 py-3 rounded-xl transition text-base">
              View Dashboard →
            </Link>
            <a href="#pricing" className="border border-zinc-700 hover:border-zinc-500 text-zinc-300 font-medium px-8 py-3 rounded-xl transition text-base">
              See Pricing
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Everything you need to keep agents alive</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-4">Simple, transparent pricing</h2>
        <p className="text-zinc-400 text-center mb-12">Start free. Upgrade when you need more.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((t) => (
            <div key={t.name} className={`rounded-xl p-8 border ${t.highlight ? "border-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500/20" : "border-zinc-800 bg-zinc-900"}`}>
              <h3 className="text-xl font-bold mb-1">{t.name}</h3>
              <div className="mb-1">
                <span className="text-4xl font-bold">{t.price}</span>
                <span className="text-zinc-500 text-sm">{t.period}</span>
              </div>
              <p className="text-emerald-400 text-sm font-medium mb-1">{t.endpoints}</p>
              <p className="text-zinc-500 text-xs mb-6">{t.checks}</p>
              <ul className="space-y-2 mb-8">
                {t.features.map((feat) => (
                  <li key={feat} className="text-zinc-300 text-sm flex items-center gap-2">
                    <span className="text-emerald-400">✓</span> {feat}
                  </li>
                ))}
              </ul>
              <button className={`w-full py-2.5 rounded-lg font-medium transition text-sm ${t.highlight ? "bg-emerald-500 hover:bg-emerald-400 text-black" : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200"}`}>
                {t.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-8 text-center text-zinc-500 text-sm">
        © 2026 AgentPulse by Pragmasix. Built with Next.js on Vercel.
      </footer>
    </main>
  );
}
