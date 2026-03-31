import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const rows = db.prepare(
    "SELECT * FROM checks WHERE endpoint_id = ? ORDER BY checked_at DESC LIMIT 288"
  ).all(id);
  return NextResponse.json(rows);
}
