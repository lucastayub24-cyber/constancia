import {createHmac,randomBytes,timingSafeEqual} from "crypto";
import {db} from "@/lib/db";
import {appUrl} from "@/lib/utils";
import {decryptSecret,encryptSecret} from "@/lib/secret-box";

const API="https://api.mercadopago.com";
const AUTH="https://auth.mercadopago.com.ar/authorization";

type OAuthToken={
  access_token:string;
  token_type:string;
  expires_in:number;
  scope?:string;
  user_id:number|string;
  refresh_token?:string;
  public_key?:string;
  live_mode?:boolean;
};

function clientId(){const v=process.env.MERCADOPAGO_CLIENT_ID;if(!v)throw new Error("MERCADOPAGO_CLIENT_ID no configurado");return v}
function clientSecret(){const v=process.env.MERCADOPAGO_CLIENT_SECRET;if(!v)throw new Error("MERCADOPAGO_CLIENT_SECRET no configurado");return v}
export function sellerOAuthConfigured(){return Boolean(process.env.MERCADOPAGO_CLIENT_ID&&process.env.MERCADOPAGO_CLIENT_SECRET)}
export function sellerRedirectUri(){return appUrl("/api/mercadopago/oauth/callback")}

async function oauth(body:URLSearchParams){
  const r=await fetch(API+"/oauth/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded",accept:"application/json"},body,cache:"no-store"});
  const j=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error("Mercado Pago OAuth "+r.status+": "+(j.message||j.error||"No se pudo conectar la cuenta"));
  return j as OAuthToken;
}

function sign(value:string){return createHmac("sha256",clientSecret()).update(value).digest("base64url")}
export function createSellerOAuthState(organizationId:string){
  const payload=[organizationId,Date.now().toString(),randomBytes(16).toString("hex")].join(".");
  return Buffer.from(payload).toString("base64url")+"."+sign(payload);
}
export function readSellerOAuthState(state:string){
  const [encoded,sig]=state.split(".");
  if(!encoded||!sig)throw new Error("Estado OAuth inválido");
  const payload=Buffer.from(encoded,"base64url").toString("utf8");
  const expected=sign(payload);
  const a=Buffer.from(sig),b=Buffer.from(expected);
  if(a.length!==b.length||!timingSafeEqual(a,b))throw new Error("Estado OAuth inválido");
  const [organizationId,issuedRaw]=payload.split(".");
  const issued=Number(issuedRaw);
  if(!organizationId||!Number.isFinite(issued)||Date.now()-issued>15*60*1000)throw new Error("La autorización venció. Volvé a conectar Mercado Pago.");
  return {organizationId};
}

export function sellerAuthorizationUrl(organizationId:string){
  const state=createSellerOAuthState(organizationId);
  const u=new URL(AUTH);
  u.searchParams.set("client_id",clientId());
  u.searchParams.set("response_type","code");
  u.searchParams.set("platform_id","mp");
  u.searchParams.set("redirect_uri",sellerRedirectUri());
  u.searchParams.set("state",state);
  return u.toString();
}

export async function exchangeSellerCode(code:string,state:string){
  return oauth(new URLSearchParams({
    client_id:clientId(),
    client_secret:clientSecret(),
    grant_type:"authorization_code",
    code,
    redirect_uri:sellerRedirectUri(),
    state,
  }));
}

async function refreshSeller(refreshToken:string){
  return oauth(new URLSearchParams({
    client_id:clientId(),
    client_secret:clientSecret(),
    grant_type:"refresh_token",
    refresh_token:refreshToken,
  }));
}

export async function saveSellerConnection(organizationId:string,t:OAuthToken){
  const expiresAt=new Date(Date.now()+Math.max(60,Number(t.expires_in||15552000))*1000);
  await db.organization.update({where:{id:organizationId},data:{
    mpSellerUserId:String(t.user_id),
    mpSellerPublicKey:t.public_key||null,
    mpSellerAccessTokenEnc:encryptSecret(t.access_token),
    mpSellerRefreshTokenEnc:t.refresh_token?encryptSecret(t.refresh_token):null,
    mpSellerTokenExpiresAt:expiresAt,
    mpSellerConnectedAt:new Date(),
    mpSellerScope:t.scope||null,
    mpSellerLiveMode:Boolean(t.live_mode),
  }});
}

export async function getSellerAccessToken(organizationId:string){
  const org=await db.organization.findUnique({where:{id:organizationId},select:{
    mpSellerAccessTokenEnc:true,mpSellerRefreshTokenEnc:true,mpSellerTokenExpiresAt:true,
    mpSellerPublicKey:true,mpSellerUserId:true
  }});
  if(!org?.mpSellerAccessTokenEnc)throw new Error("El profesional todavía no conectó su cuenta de Mercado Pago.");
  const expiresSoon=!org.mpSellerTokenExpiresAt||org.mpSellerTokenExpiresAt.getTime()<Date.now()+48*60*60*1000;
  if(!expiresSoon)return decryptSecret(org.mpSellerAccessTokenEnc);
  if(!org.mpSellerRefreshTokenEnc)throw new Error("La conexión de Mercado Pago venció. El profesional debe volver a conectarla.");
  const refreshed=await refreshSeller(decryptSecret(org.mpSellerRefreshTokenEnc));
  await saveSellerConnection(organizationId,refreshed);
  return refreshed.access_token;
}

async function sellerMp<T>(organizationId:string,path:string,init?:RequestInit):Promise<T>{
  const accessToken=await getSellerAccessToken(organizationId);
  const r=await fetch(API+path,{...init,headers:{Authorization:"Bearer "+accessToken,"Content-Type":"application/json",...(init?.headers||{})},cache:"no-store"});
  const j=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error("Mercado Pago "+r.status+": "+JSON.stringify(j));
  return j as T;
}

export async function createSellerPaymentPreference(input:{
  organizationId:string;certificateId:string;certificateCode:string;title:string;amount:number;
  currency:string;payerEmail?:string|null;
}){
  const back=(status:string)=>appUrl("/v/"+encodeURIComponent(input.certificateCode)+"?payment="+status);
  return sellerMp<{id:string;init_point:string;sandbox_init_point?:string;collector_id?:number}>(input.organizationId,"/checkout/preferences",{
    method:"POST",
    body:JSON.stringify({
      items:[{id:input.certificateId,title:"Constancia · "+input.title,quantity:1,currency_id:input.currency||"ARS",unit_price:input.amount}],
      payer:input.payerEmail?{email:input.payerEmail}:undefined,
      external_reference:"constancia_service_"+input.organizationId+"_"+input.certificateId,
      back_urls:{success:back("success"),pending:back("pending"),failure:back("failure")},
      auto_return:"approved",
      notification_url:appUrl("/api/mercadopago/webhook?seller_org="+encodeURIComponent(input.organizationId)),
    }),
  });
}

export function getSellerPayment(organizationId:string,id:string){
  return sellerMp<any>(organizationId,"/v1/payments/"+encodeURIComponent(id));
}
