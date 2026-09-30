import { NextResponse } from "next/server";

export async function GET() {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  const webhookSecretConfigured = Boolean(process.env.MERCADOPAGO_WEBHOOK_SECRET);
  let accessTokenValid = false;
  let apiStatus: number | null = null;

  if (accessToken) {
    try {
      const response = await fetch("https://api.mercadopago.com/users/me", {
        headers: { Authorization: "Bearer " + accessToken },
        cache: "no-store",
      });
      apiStatus = response.status;
      accessTokenValid = response.ok;
    } catch {
      apiStatus = null;
    }
  }

  return NextResponse.json(
    {
      configured: Boolean(accessToken) && webhookSecretConfigured,
      accessTokenConfigured: Boolean(accessToken),
      accessTokenValid,
      webhookSecretConfigured,
      apiStatus,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
