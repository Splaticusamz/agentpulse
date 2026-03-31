#!/usr/bin/env npx tsx
import Database from "better-sqlite3";
import { v4 as uuid } from "uuid";
import path from "path";

const db = new Database(path.join(__dirname, "..", "agentpulse.db"));
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS endpoints (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, url TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'http', slug TEXT UNIQUE NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS checks (
    id TEXT PRIMARY KEY, endpoint_id TEXT NOT NULL REFERENCES endpoints(id) ON DELETE CASCADE,
    status TEXT NOT NULL, response_time INTEGER, status_code INTEGER,
    error TEXT, checked_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS incidents (
    id TEXT PRIMARY KEY, endpoint_id TEXT NOT NULL REFERENCES endpoints(id) ON DELETE CASCADE,
    started_at TEXT NOT NULL DEFAULT (datetime('now')), resolved_at TEXT,
    type TEXT NOT NULL DEFAULT 'downtime'
  );
`);

const seeds = [
  { name: "OpenAI API", url: "https://api.openai.com/v1/models", type: "http", slug: "openai" },
  { name: "Anthropic API", url: "https://api.anthropic.com/v1/messages", type: "http", slug: "anthropic" },
  { name: "Google Gemini", url: "https://generativelanguage.googleapis.com/v1beta/models", type: "http", slug: "gemini" },
  { name: "Hugging Face Inference", url: "https://api-inference.huggingface.co/models", type: "http", slug: "huggingface" },
  { name: "ACP Watchtower", url: "https://acp-watchtower.vercel.app", type: "http", slug: "acp-watchtower" },
];

const stmt = db.prepare("INSERT OR IGNORE INTO endpoints (id, name, url, type, slug) VALUES (?, ?, ?, ?, ?)");
for (const s of seeds) {
  stmt.run(uuid(), s.name, s.url, s.type, s.slug);
  console.log(`✓ Seeded: ${s.name}`);
}

console.log("\n✅ Database seeded with 5 endpoints");
db.close();
