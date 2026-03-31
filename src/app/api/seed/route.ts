import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { checkEndpoint } from "@/lib/checker";
import { v4 as uuid } from "uuid";

const DEMO_ENDPOINTS = [
  { name: "OpenAI API", url: "https://api.openai.com/v1/models", type: "http", slug: "openai-api" },
  { name: "Anthropic API", url: "https://api.anthropic.com/v1/messages", type: "http", slug: "anthropic-api" },
  { name: "GitHub API", url: "https://api.github.com", type: "http", slug: "github-api" },
  { name: "JSONPlaceholder", url: "https://jsonplaceholder.typicode.com/posts/1", type: "http", slug: "jsonplaceholder" },
  { name: "HTTPBin", url: "https://httpbin.org/get", type: "http", slug: "httpbin" },
];

export async function POST() {
  const db = getDb();
  const added: string[] = [];

  for (const ep of DEMO_ENDPOINTS) {
    const existing = db.prepare("SELECT id FROM endpoints WHERE slug = ?").get(ep.slug);
    if (existing) continue;
    const id = uuid();
    db.prepare("INSERT INTO endpoints (id, name, url, type, slug) VALUES (?, ?, ?, ?, ?)").run(
      id, ep.name, ep.url, ep.type, ep.slug
    );
    added.push(ep.name);

    // Run initial check
    const result = await checkEndpoint(ep.url, ep.type);
    db.prepare(
      "INSERT INTO checks (id, endpoint_id, status, response_time, status_code, error, checked_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))"
    ).run(uuid(), id, result.status, result.responseTime, result.statusCode, result.error);
  }

  return NextResponse.json({ seeded: added });
}
