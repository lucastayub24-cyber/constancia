import {randomBytes,timingSafeEqual} from "crypto";
import {appUrl} from "@/lib/utils";

const AUTH_URL="https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL="https://oauth2.googleapis.com/token";
const USERINFO_URL="https://openidconnect.googleapis.com/v1/userinfo";

export type GoogleProfile={
  sub:string;
  email:string;
  email_verified:boolean;
  name?:string;
  given_name?:string;
  family_name?:string;
  picture?:string;
  hd?:string;
};

function clientId(){const v=process.env.GOOGLE_CLIENT_ID;if(!v)throw new Error("GOOGLE_CLIENT_ID no configurado");return v}
function clientSecret(){const v=process.env.GOOGLE_CLIENT_SECRET;if(!v)throw new Error("GOOGLE_CLIENT_SECRET no configurado");return v}

export function googleAuthConfigured(){return Boolean(process.env.GOOGLE_CLIENT_ID&&process.env.GOOGLE_CLIENT_SECRET)}
export function googleRedirectUri(){return appUrl("/api/auth/google/callback")}
export function newGoogleState(){return randomBytes(32).toString("base64url")}
export function safeNext(value?:string|null){return value&&value.startsWith("/")&&!value.startsWith("//")?value:"/dashboard"}
export function sameState(a?:string|null,b?:string|null){
  if(!a||!b)return false;
  const aa=Buffer.from(a),bb=Buffer.from(b);
  return aa.length===bb.length&&timingSafeEqual(aa,bb);
}

export function googleAuthorizationUrl(state:string){
  const u=new URL(AUTH_URL);
  u.searchParams.set("client_id",clientId());
  u.searchParams.set("redirect_uri",googleRedirectUri());
  u.searchParams.set("response_type","code");
  u.searchParams.set("scope","openid email profile");
  u.searchParams.set("state",state);
  u.searchParams.set("prompt","select_account");
  u.searchParams.set("include_granted_scopes","true");
  return u.toString();
}

export async function exchangeGoogleCode(code:string){
  const body=new URLSearchParams({
    client_id:clientId(),
    client_secret:clientSecret(),
    code,
    grant_type:"authorization_code",
    redirect_uri:googleRedirectUri(),
  });
  const r=await fetch(TOKEN_URL,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body,cache:"no-store"});
  const j=await r.json().catch(()=>({}));
  if(!r.ok||!j.access_token)throw new Error("Google OAuth "+r.status+": "+(j.error_description||j.error||"No se pudo iniciar sesión"));
  return j as {access_token:string;token_type:string;expires_in:number;scope?:string;id_token?:string};
}

export async function googleUserInfo(accessToken:string){
  const r=await fetch(USERINFO_URL,{headers:{Authorization:"Bearer "+accessToken},cache:"no-store"});
  const j=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error("No se pudo obtener el perfil de Google");
  const p=j as GoogleProfile;
  if(!p.sub||!p.email||!p.email_verified)throw new Error("Google no confirmó el email de esta cuenta");
  return p;
}
