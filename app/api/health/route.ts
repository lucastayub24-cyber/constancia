import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  let database = false;
  let databaseError: string | null = null;
  let schemaTables: string[] = [];
  try {
    await db.$queryRaw`SELECT 1`;
    database = true;
    const rows = await db.$queryRaw<Array<{ table_name: string }>>`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' ORDER BY table_name
    `;
    schemaTables = rows.map((row) => row.table_name);
  } catch (error) {
    databaseError = error instanceof Error ? error.message.split("\n")[0].slice(0,180) : "Database unavailable";
  }
  const present = (name:string) => Boolean(process.env[name]);
  const coreTables = ["User","Session","Organization","Membership","Client","Certificate","CertificatePayment"];
  return NextResponse.json({
    ok: database && coreTables.every((table)=>schemaTables.includes(table)),
    database,
    databaseError,
    schemaReady: coreTables.every((table)=>schemaTables.includes(table)),
    schemaTables,
    optionalIntegrations:{
      mercadoPago:present("MERCADOPAGO_ACCESS_TOKEN")&&present("MERCADOPAGO_WEBHOOK_SECRET"),
      transactionalEmail:present("RESEND_API_KEY")&&present("EMAIL_FROM"),
      r2Storage:present("R2_ENDPOINT")&&present("R2_ACCESS_KEY_ID")&&present("R2_SECRET_ACCESS_KEY")&&present("R2_BUCKET"),
      cronSecret:present("CRON_SECRET"),
      legalIdentity:present("LEGAL_BUSINESS_NAME")&&present("LEGAL_CUIT")&&present("LEGAL_ADDRESS")&&present("LEGAL_EMAIL")
    }
  },{headers:{"Cache-Control":"no-store"}});
}
