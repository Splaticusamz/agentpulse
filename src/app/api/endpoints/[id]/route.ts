import { NextRequest, NextResponse } from "next/server";
import { getClient, migrate } from "@/lib/db";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = getClient();
  await migrate();
  const result = await client.execute({ sql: "DELETE FROM endpoints WHERE id = ?", args: [id] });
  if (result.rowsAffected === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ deleted: true });
}
