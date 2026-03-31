# Architecture

## System Overview

AgentPulse is a Next.js application that monitors AI agent endpoints (MCP servers, ACP manifests, LLM APIs) via scheduled health checks and exposes results through public status pages and a management dashboard.

## Data Flow

1. **Registration** — User adds endpoint (URL, type, name, check interval)
2. **Health Checks** — Vercel Cron triggers `/api/cron/check` every 1-5 minutes
3. **Storage** — Check results stored in Turso (libSQL) with timestamps, status codes, response times
4. **Display** — Status pages pull latest data, compute uptime %, render incident timelines
5. **Alerts** — (Pro) Failed checks trigger email/webhook notifications

## Database Schema (Turso/libSQL)

```sql
-- Endpoints to monitor
CREATE TABLE endpoints (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT NOT NULL, -- 'mcp' | 'acp' | 'llm' | 'http'
  check_interval INTEGER DEFAULT 300, -- seconds
  slug TEXT UNIQUE,
  created_at INTEGER,
  updated_at INTEGER
);

-- Health check results
CREATE TABLE checks (
  id TEXT PRIMARY KEY,
  endpoint_id TEXT NOT NULL,
  status INTEGER, -- HTTP status code
  response_time INTEGER, -- ms
  is_up BOOLEAN,
  error TEXT,
  checked_at INTEGER,
  FOREIGN KEY (endpoint_id) REFERENCES endpoints(id)
);

-- Detected incidents
CREATE TABLE incidents (
  id TEXT PRIMARY KEY,
  endpoint_id TEXT NOT NULL,
  started_at INTEGER,
  resolved_at INTEGER,
  duration INTEGER, -- seconds
  FOREIGN KEY (endpoint_id) REFERENCES endpoints(id)
);
```

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/endpoints` | GET/POST | List/create endpoints |
| `/api/endpoints/[id]` | GET/PUT/DELETE | Manage endpoint |
| `/api/cron/check` | GET | Run health checks (Vercel Cron) |
| `/api/status/[slug]` | GET | Public status data |
| `/api/badge/[slug]` | GET | SVG uptime badge |

## Key Decisions

- **Turso over Vercel KV** — Need relational queries for check history, incident detection
- **No auth wall V1** — Cookie-based sessions, lower friction for adoption
- **Vercel Cron** — Free tier supports 1/day, Pro supports every minute; sufficient for MVP
- **Edge-first** — Status pages and badges served from edge for global speed
