import {createHash} from "crypto";
import {db} from "@/lib/db";

export class RateLimitError extends Error {
  status=429;
  constructor(){super("Demasiados intentos. Probá nuevamente más tarde.")}
}

function ip(request:Request){
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()||
    request.headers.get("x-real-ip")?.trim()||
    "unknown";
}

export async function consumeRateLimit(request:Request,scope:string,identity:string,limit:number,windowMs:number){
  const raw=scope+"|"+identity.toLowerCase()+"|"+ip(request);
  const key=createHash("sha256").update(raw).digest("hex");
  const since=new Date(Date.now()-windowMs);
  const count=await db.rateLimitEvent.count({where:{key,createdAt:{gte:since}}});
  if(count>=limit)throw new RateLimitError();
  await db.rateLimitEvent.create({data:{key}});
}

export async function pruneRateLimitEvents(){
  await db.rateLimitEvent.deleteMany({where:{createdAt:{lt:new Date(Date.now()-7*86400000)}}});
}
