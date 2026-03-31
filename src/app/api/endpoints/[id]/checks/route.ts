import { NextRequest, NextResponse } from "next/server";
import { getClient, migrate } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = getClient();
  await migrate();
  const result = await client.execute({
    sql: "SELECT * FROM checks WHERE endpoint_id = ? ORDER BY checked_at DESC LIMIT 288",
    args: [id],
  });
  return NextResponse.json(result.rows);
}
