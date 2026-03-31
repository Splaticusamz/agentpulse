import { NextResponse } from "next/server";
import { getClient, migrate } from "@/lib/db";

export async function GET() {
  const client = getClient();
  await migrate();
  const endpoints = await client.execute("SELECT name, url, type, slug FROM endpoints ORDER BY created_at");
  const webhooks = await client.execute("SELECT url, events FROM webhooks");
  return NextResponse.json({
    version: 1,
    exported_at: new Date().toISOString(),
    endpoints: endpoints.rows,
    webhooks: webhooks.rows,
  });
}
