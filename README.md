# AgentPulse ⚡

**AI Agent Uptime Monitor & Status Pages**

Monitor your AI agents, MCP servers, and LLM API endpoints. Get public status pages, uptime badges, and instant alerts when things go down.

> The first dedicated monitoring solution for the AI agent ecosystem.

🌐 **Live:** [agentpulse.vercel.app](https://agentpulse.vercel.app)

---

## Why AgentPulse?

120+ AI agent tools are shipping every month. MCP servers are everywhere. But there's **zero dedicated monitoring** for this ecosystem. Traditional uptime tools don't understand agent protocols, manifest validation, or MCP health checks.

AgentPulse fills that gap.

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│  Dashboard   │────▶│  Next.js API  │────▶│  Health Checker  │
│  (React/TW)  │     │  (App Router) │     │  (Vercel Cron)   │
└─────────────┘     └──────────────┘     └─────────────────┘
                           │                       │
                    ┌──────┴──────┐         ┌──────┴──────┐
                    │   Turso DB  │         │  Endpoints   │
                    │  (SQLite)   │         │  MCP/ACP/LLM │
                    └─────────────┘         └─────────────┘
                           │
                    ┌──────┴──────┐
                    │ Status Pages │
                    │ /status/[id] │
                    └─────────────┘
```

### Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Database:** Turso (libSQL/SQLite edge)
- **Scheduling:** Vercel Cron (5-min health checks)
- **UI:** Tailwind CSS + shadcn/ui
- **Deployment:** Vercel (Edge-optimized)
- **Badges:** Dynamic SVG generation

## Revenue Model

| Tier | Price | Endpoints | Check Interval | Features |
|------|-------|-----------|----------------|----------|
| **Free** | $0 | 3 | 5 min | Public status page, badges |
| **Pro** | $9/mo | 25 | 1 min | Alerts, private pages, API |
| **Team** | $19/mo | 100 | 1 min | Multi-region, webhooks, priority support |

**Revenue timeline:** 2-3 weeks to first paying users via SEO + AI agent community.

## Features

- ✅ Endpoint registration (MCP, ACP, LLM APIs)
- ✅ Automated health checks (cron-based)
- ✅ Public status pages with uptime %
- ✅ Incident timeline (auto-detected)
- ✅ SVG uptime badges for READMEs
- ✅ Management dashboard
- 🔜 Email/webhook alerts
- 🔜 Multi-region checks
- 🔜 Response time sparklines
- 🔜 ACP Watchtower integration

## Getting Started

```bash
npm install
npm run dev
# → http://localhost:3000
```

## Related Projects

- [ACP Watchtower](https://acp-watchtower.vercel.app) — ACP manifest validator (validate → monitor pipeline)

## License

MIT

---

Built by [Pragmasix](https://pragmasix.vercel.app) 🤖
