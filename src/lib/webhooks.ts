import { getClient } from "./db";

interface WebhookPayload {
  event: string;
  endpoint: { name: string; url: string; slug: string };
  incident: { id: string; started_at: string; resolved_at?: string; type: string };
  timestamp: string;
}

export async function fireWebhooks(event: string, payload: WebhookPayload) {
  const client = getClient();
  
  // Get webhooks that match this event (global or endpoint-specific)
  const result = await client.execute({
    sql: "SELECT * FROM webhooks WHERE (endpoint_id IS NULL OR endpoint_id = ?) AND events LIKE ?",
    args: [payload.endpoint.slug, `%${event}%`],
  });

  const results = await Promise.allSettled(
    result.rows.map((wh) =>
      fetch(wh.url as string, {
        method: "POST",
        headers: { "Content-Type": "application/json", "User-Agent": "AgentPulse/1.0" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(5000),
      })
    )
  );

  return { sent: results.length, ok: results.filter((r) => r.status === "fulfilled").length };
}
