import webpush from "web-push";
import {createECDH,createHmac} from "crypto";
import {db} from "@/lib/db";

export type PushPayload={title:string;body:string;href?:string;tag?:string};

function vapidKeys(){
 const secret=process.env.JWT_SECRET;
 if(!secret)throw new Error("JWT_SECRET no configurado");
 for(let i=0;i<100;i++){
  const candidate=createHmac("sha256",secret).update("constancia-vapid-"+i).digest();
  try{
   const ecdh=createECDH("prime256v1");
   ecdh.setPrivateKey(candidate);
   return {privateKey:ecdh.getPrivateKey().toString("base64url"),publicKey:ecdh.getPublicKey(undefined,"uncompressed").toString("base64url")};
  }catch{}
 }
 throw new Error("No se pudo derivar la clave VAPID");
}
export function pushPublicKey(){return vapidKeys().publicKey}
function configure(){
 const keys=vapidKeys();
 webpush.setVapidDetails(process.env.NEXT_PUBLIC_APP_URL||"https://constancia-nu.vercel.app",keys.publicKey,keys.privateKey);
}
async function deliver(sub:{id:string;endpoint:string;p256dh:string;auth:string},payload:PushPayload){
 configure();
 try{
  await webpush.sendNotification({endpoint:sub.endpoint,keys:{p256dh:sub.p256dh,auth:sub.auth}},JSON.stringify(payload),{TTL:60*60});
  return true;
 }catch(error:any){
  if(error?.statusCode===404||error?.statusCode===410)await db.pushSubscription.delete({where:{id:sub.id}}).catch(()=>undefined);
  return false;
 }
}
export async function sendPushToUser(userId:string,payload:PushPayload){
 const subs=await db.pushSubscription.findMany({where:{userId}});
 const results=await Promise.all(subs.map(s=>deliver(s,payload)));
 return results.filter(Boolean).length;
}
export async function sendPushToOrganization(organizationId:string,payload:PushPayload){
 const subs=await db.pushSubscription.findMany({where:{organizationId}});
 const results=await Promise.all(subs.map(s=>deliver(s,payload)));
 return results.filter(Boolean).length;
}
export async function sendPushToAdmins(payload:PushPayload){
 const subs=await db.pushSubscription.findMany({where:{user:{role:"ADMIN"}}});
 const results=await Promise.all(subs.map(s=>deliver(s,payload)));
 return results.filter(Boolean).length;
}
