import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const db = getDb();
  const endpoints = db.prepare("SELECT name, url, type, slug FROM endpoints ORDER BY created_at").all();
  const webhooks = db.prepare("SELECT url, events FROM webhooks").all();
  return NextResponse.json({ version: 1, exported_at: new Date().toISOString(), endpoints, webhooks });
}
