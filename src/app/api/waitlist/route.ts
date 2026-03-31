import { NextRequest, NextResponse } from "next/server";
import { getClient, migrate } from "@/lib/db";
import { v4 as uuid } from "uuid";

export async function GET() {
  const client = getClient();
  await migrate();
  const result = await client.execute("SELECT COUNT(*) as count FROM waitlist");
  return NextResponse.json({ count: Number(result.rows[0]?.count ?? 0) });
}

export async function POST(req: NextRequest) {
  const { email, plan = "pro" } = await req.json();
  if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });
  const client = getClient();
  await migrate();
  try {
    await client.execute({ sql: "INSERT INTO waitlist (id, email, plan) VALUES (?, ?, ?)", args: [uuid(), email, plan] });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Already on waitlist" }, { status: 409 });
  }
}
