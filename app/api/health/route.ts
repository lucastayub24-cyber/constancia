import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  let database = false;
  let databaseError: string | null = null;
  try {
    await db.$queryRaw`SELECT 1`;
    database = true;
  } catch (error) {
    databaseError = error instanceof Error ? error.message.split("\n")[0].slice(0, 180) : "Database unavailable";
  }

  const present = (name: string) => Boolean(process.env[name]);

  return NextResponse.json({
    ok: database && present("JWT_SECRET"),
    database,
    databaseError,
    env: {
      nextPublicAppUrl: present("NEXT_PUBLIC_APP_URL"),
      jwtSecret: present("JWT_SECRET"),
      mercadoPagoAccessToken: present("MERCADOPAGO_ACCESS_TOKEN"),
      mercadoPagoWebhookSecret: present("MERCADOPAGO_WEBHOOK_SECRET"),
      resendApiKey: present("RESEND_API_KEY"),
      emailFrom: present("EMAIL_FROM"),
      r2Endpoint: present("R2_ENDPOINT"),
      r2AccessKeyId: present("R2_ACCESS_KEY_ID"),
      r2SecretAccessKey: present("R2_SECRET_ACCESS_KEY"),
      r2Bucket: present("R2_BUCKET"),
      cronSecret: present("CRON_SECRET"),
      legalBusinessName: present("LEGAL_BUSINESS_NAME"),
      legalCuit: present("LEGAL_CUIT"),
      legalAddress: present("LEGAL_ADDRESS"),
      legalEmail: present("LEGAL_EMAIL")
    }
  }, { headers: { "Cache-Control": "no-store" } });
}
