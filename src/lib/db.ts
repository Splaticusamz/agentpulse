import { createClient, type Client } from "@libsql/client";

let _client: Client | null = null;

export function getClient(): Client {
  if (_client) return _client;
  
  // Turso for production, local file for dev, /tmp for serverless fallback
  const url = process.env.TURSO_DATABASE_URL || (process.env.VERCEL ? "file:/tmp/agentpulse.db" : "file:agentpulse.db");
  const authToken = process.env.TURSO_AUTH_TOKEN;
  
  _client = createClient({ url, authToken });
  return _client;
}

export async function migrate() {
  const client = getClient();
  const statements = [
    `CREATE TABLE IF NOT EXISTS endpoints (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'http',
      slug TEXT UNIQUE NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS checks (
      id TEXT PRIMARY KEY,
      endpoint_id TEXT NOT NULL,
      status TEXT NOT NULL,
      response_time INTEGER,
      status_code INTEGER,
      error TEXT,
      checked_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE INDEX IF NOT EXISTS idx_checks_endpoint ON checks(endpoint_id, checked_at DESC)`,
    `CREATE TABLE IF NOT EXISTS incidents (
      id TEXT PRIMARY KEY,
      endpoint_id TEXT NOT NULL,
      started_at TEXT NOT NULL DEFAULT (datetime('now')),
      resolved_at TEXT,
      type TEXT NOT NULL DEFAULT 'downtime'
    )`,
    `CREATE INDEX IF NOT EXISTS idx_incidents_endpoint ON incidents(endpoint_id, started_at DESC)`,
    `CREATE TABLE IF NOT EXISTS webhooks (
      id TEXT PRIMARY KEY,
      endpoint_id TEXT,
      url TEXT NOT NULL,
      events TEXT NOT NULL DEFAULT 'incident.created,incident.resolved',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS waitlist (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      plan TEXT NOT NULL DEFAULT 'pro',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
  ];
  for (const stmt of statements) {
    await client.execute(stmt);
  }
}
