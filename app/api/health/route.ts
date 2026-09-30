import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  let database = false;
  let schemaReady = false;
  try {
    await db.$queryRaw`SELECT 1`;
    database = true;
    const rows = await db.$queryRaw<Array<{ table_name: string }>>`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
    `;
    const tables = new Set(rows.map((row) => row.table_name));
    schemaReady = ["User","Session","Organization","Membership","Client","Certificate","CertificatePayment"]
      .every((table) => tables.has(table));
  } catch {}
  return NextResponse.json(
    { ok: database && schemaReady, database, schemaReady },
    { headers: { "Cache-Control": "no-store" } }
  );
}
