import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { db } from "@/lib/db";

const COOKIE = "constancia_session";
const secret = () => new TextEncoder().encode(process.env.JWT_SECRET || "dev-only-change-me-please-32-chars");

export async function createSession(userId: string) {
  const token = await new SignJWT({ userId }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("30d").sign(secret());
  const jar = await cookies();
  jar.set(COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 30 });
}
export async function clearSession(){const jar=await cookies();jar.set(COOKIE,"",{httpOnly:true,expires:new Date(0),path:"/"});}
export async function sessionUserId(){const jar=await cookies();const token=jar.get(COOKIE)?.value;if(!token)return null;try{const{payload}=await jwtVerify(token,secret());return typeof payload.userId==="string"?payload.userId:null}catch{return null}}
export async function currentUser(){const id=await sessionUserId();if(!id)return null;return db.user.findUnique({where:{id},include:{organization:true}})}
