# ⚡ AgentPulse

AI Agent Uptime Monitor & Status Pages. Monitor MCP servers, ACP manifests, and LLM endpoints with automated health checks, beautiful status pages, and instant webhook alerts.

**Live:** [agentpulse-woad.vercel.app](https://agentpulse-woad.vercel.app)

## Features

- 🔍 **Endpoint Monitoring** — HTTP, MCP SSE, ACP manifest health checks
- 📊 **Status Pages** — Auto-generated public status pages per endpoint
- 🏷️ **Uptime Badges** — SVG badges for READMEs (`/api/badge/your-slug`)
- 🔔 **Webhook Alerts** — Instant notifications on incidents
- 📈 **Sparkline Charts** — 24h response time visualization
- 🌐 **Agent Directory** — Browse all monitored endpoints
- ⏰ **Cron Checks** — Automated 5-minute health pings via Vercel Cron

## Tech Stack

- **Next.js 16** (App Router + RSC)
- **@libsql/client** (Turso/SQLite)
- **Tailwind CSS v4**
- **Vercel** (Hosting + Cron)

## Quick Start

```bash
npm install
npm run dev
```

Visit `/dashboard` → Seed demo endpoints → Monitor!

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/endpoints` | List all endpoints |
| POST | `/api/endpoints` | Register endpoint |
| POST | `/api/endpoints/check` | Trigger immediate check |
| GET | `/api/status/:slug` | Endpoint status + history |
| GET | `/api/badge/:slug` | SVG uptime badge |
| GET | `/api/summary` | Global status overview |
| POST | `/api/webhooks` | Register webhook alert |
| POST | `/api/seed` | Seed demo data |
| GET | `/api/export` | Export all config as JSON |

Full docs at `/docs`.

## Production Setup

Set environment variables:
```
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your-token
CRON_SECRET=your-secret
NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
```

## Revenue Model

- **Free:** 3 endpoints, 5-min checks, public status page
- **Pro ($9/mo):** 25 endpoints, 1-min checks, alerts, private pages
- **Team ($19/mo):** 100 endpoints, multi-region, API access

---

Built by [Pragmasix](https://pragmasix.vercel.app) 🚀
