import {NextResponse} from "next/server";
import {db} from "@/lib/db";
import {currentUser} from "@/lib/auth";
import {consumeRateLimit,RateLimitError} from "@/lib/rate-limit";

const clean=(v:unknown,max=2000)=>String(v??"").trim().slice(0,max);

export async function GET(){
 const user=await currentUser();
 if(!user)return NextResponse.json({error:"UNAUTHORIZED"},{status:401});
 const threads=await db.supportThread.findMany({
   where:{userId:user.id},
   orderBy:{lastMessageAt:"desc"},
   take:10,
   include:{messages:{orderBy:{createdAt:"asc"},take:80}}
 });
 return NextResponse.json({threads});
}

export async function POST(request:Request){
 try{
  const body=await request.json();
  const user=await currentUser();
  const message=clean(body.message,3000);
  if(message.length<2)return NextResponse.json({error:"Escribí tu consulta."},{status:400});
  if(user){
    await consumeRateLimit(request,"support-user",user.id,30,15*60*1000);
    let organizationId=user.activeOrganizationId||null;
    if(organizationId){
      const membership=await db.membership.findFirst({where:{userId:user.id,organizationId},select:{id:true}});
      if(!membership)organizationId=null;
    }
    const existing=await db.supportThread.findFirst({where:{userId:user.id,status:{not:"CLOSED"}},orderBy:{lastMessageAt:"desc"}});
    const thread=existing?await db.supportThread.update({where:{id:existing.id},data:{status:"OPEN",lastMessageAt:new Date()}}):await db.supportThread.create({data:{
      userId:user.id,organizationId,name:user.name,email:user.email,subject:clean(body.subject,120)||"Consulta desde Constancia",status:"OPEN"
    }});
    const created=await db.supportMessage.create({data:{threadId:thread.id,sender:"USER",senderUserId:user.id,body:message}});
    await db.supportThread.update({where:{id:thread.id},data:{lastMessageAt:created.createdAt,status:"OPEN"}});
    return NextResponse.json({ok:true,threadId:thread.id});
  }

  const email=clean(body.email,180).toLowerCase();
  const name=clean(body.name,120);
  if(!email.includes("@"))return NextResponse.json({error:"Ingresá un email válido para poder responderte."},{status:400});
  await consumeRateLimit(request,"support-public",email,8,60*60*1000);
  const thread=await db.supportThread.create({data:{name,email,subject:clean(body.subject,120)||"Consulta desde la web",status:"OPEN"}});
  await db.supportMessage.create({data:{threadId:thread.id,sender:"USER",body:message}});
  return NextResponse.json({ok:true});
 }catch(error){
  if(error instanceof RateLimitError)return NextResponse.json({error:error.message},{status:429});
  return NextResponse.json({error:error instanceof Error?error.message:"No se pudo enviar la consulta."},{status:400});
 }
}