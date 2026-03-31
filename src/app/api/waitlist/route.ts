import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { v4 as uuid } from "uuid";

export async function GET() {
  const db = getDb();
  const count = db.prepare("SELECT COUNT(*) as count FROM waitlist").get() as { count: number };
  return NextResponse.json({ count: count.count });
}

export async function POST(req: NextRequest) {
  const { email, plan = "pro" } = await req.json();
  if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });
  const db = getDb();
  try {
    db.prepare("INSERT INTO waitlist (id, email, plan) VALUES (?, ?, ?)").run(uuid(), email, plan);
    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Already on waitlist" }, { status: 409 });
  }
}
