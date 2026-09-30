import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

const COOKIE = "constancia_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  await db.session.create({
    data: {
      userId,
      tokenHash: tokenHash(token),
      expiresAt: new Date(Date.now() + MAX_AGE_SECONDS * 1000),
    },
  });
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearSession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) await db.session.deleteMany({ where: { tokenHash: tokenHash(token) } }).catch(() => undefined);
  jar.set(COOKIE, "", { httpOnly: true, expires: new Date(0), path: "/" });
}

export async function sessionUserId() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  const session = await db.session.findUnique({
    where: { tokenHash: tokenHash(token) },
    select: { id: true, userId: true, expiresAt: true },
  }).catch(() => null);
  if (!session) return null;
  if (session.expiresAt <= new Date()) {
    await db.session.delete({ where: { id: session.id } }).catch(() => undefined);
    return null;
  }
  return session.userId;
}

export async function currentUser() {
  const id = await sessionUserId();
  if (!id) return null;
  return db.user.findUnique({ where: { id } });
}

export async function requireUser() {
  const user = await currentUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}
