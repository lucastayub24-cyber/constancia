export function appUrl(path = "") {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return new URL(path, base.endsWith("/") ? base : base + "/").toString();
}

export function money(value: number, currency = "ARS") {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency, maximumFractionDigits: 2 }).format(value);
}

export function moneyCents(value: bigint | number | string | null | undefined, currency = "ARS") {
  if (value === null || value === undefined) return "—";
  return money(Number(value) / 100, currency);
}

export function slugify(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70);
}

export function cents(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) throw new Error("Importe inválido");
  return BigInt(Math.round(n * 100));
}

export function paymentStatus(total: bigint | null, paid: bigint) {
  if (total === null) return "NO_AMOUNT" as const;
  if (total === 0n || paid >= total) return "PAID" as const;
  if (paid > 0n) return "PARTIAL" as const;
  return "PENDING" as const;
}
