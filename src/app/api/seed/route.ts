import { NextResponse } from "next/server";
import { getClient, migrate } from "@/lib/db";
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
  const client = getClient();
  await migrate();
  const added: string[] = [];

  for (const ep of DEMO_ENDPOINTS) {
    const existing = await client.execute({ sql: "SELECT id FROM endpoints WHERE slug = ?", args: [ep.slug] });
    if (existing.rows.length > 0) continue;
    const id = uuid();
    await client.execute({
      sql: "INSERT INTO endpoints (id, name, url, type, slug) VALUES (?, ?, ?, ?, ?)",
      args: [id, ep.name, ep.url, ep.type, ep.slug],
    });
    added.push(ep.name);

    const result = await checkEndpoint(ep.url, ep.type);
    await client.execute({
      sql: "INSERT INTO checks (id, endpoint_id, status, response_time, status_code, error, checked_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))",
      args: [uuid(), id, result.status, result.responseTime, result.statusCode, result.error],
    });
  }

  return NextResponse.json({ seeded: added });
}
