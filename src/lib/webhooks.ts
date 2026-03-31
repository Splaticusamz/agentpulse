import { getDb } from "./db";

interface WebhookPayload {
  event: string;
  endpoint: { name: string; url: string; slug: string };
  incident: { id: string; started_at: string; resolved_at?: string; type: string };
  timestamp: string;
}

export async function fireWebhooks(event: string, payload: WebhookPayload) {
  const db = getDb();
  const webhooks = db
    .prepare(
      "SELECT * FROM webhooks WHERE (endpoint_id IS NULL OR endpoint_id = ?) AND events LIKE ?"
    )
    .all(payload.endpoint.slug, `%${event}%`) as Array<{ url: string }>;

  const results = await Promise.allSettled(
    webhooks.map((wh) =>
      fetch(wh.url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "User-Agent": "AgentPulse/1.0" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(5000),
      })
    )
  );

  return { sent: results.length, ok: results.filter((r) => r.status === "fulfilled").length };
}
