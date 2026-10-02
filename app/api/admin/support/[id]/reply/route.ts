import {NextResponse} from "next/server";
import {db} from "@/lib/db";
import {currentUser} from "@/lib/auth";
import {sendEmail} from "@/lib/email";
import {sendPushToUser} from "@/lib/push";

const esc=(v:string)=>v.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]||c));

export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
 const user=await currentUser();
 if(!user||user.role!=="ADMIN")return NextResponse.json({error:"UNAUTHORIZED"},{status:401});
 const{id}=await params;
 const body=await request.json();
 const message=String(body.message||"").trim().slice(0,3000);
 if(message.length<2)return NextResponse.json({error:"Escribí una respuesta."},{status:400});
 const thread=await db.supportThread.findUnique({where:{id},select:{id:true,email:true,name:true,userId:true,organizationId:true,user:{select:{email:true,name:true}}}});
 if(!thread)return NextResponse.json({error:"No encontrado"},{status:404});
 const m=await db.supportMessage.create({data:{threadId:id,sender:"ADMIN",senderUserId:user.id,body:message}});
 await db.supportThread.update({where:{id},data:{lastMessageAt:m.createdAt,status:"WAITING_USER"}});
 if(thread.userId&&thread.organizationId){await db.notification.create({data:{organizationId:thread.organizationId,userId:thread.userId,type:"SYSTEM",title:"Soporte respondió",body:message.slice(0,240),href:"/dashboard"}}).catch(()=>undefined);await sendPushToUser(thread.userId,{title:"Soporte Constancia respondió",body:message.slice(0,140),href:"/dashboard",tag:"support-reply-"+id}).catch(()=>undefined)}
 const to=thread.user?.email||thread.email;
 if(to){
  const hello=esc(thread.user?.name||thread.name||"");
  const html='<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto"><h2>Soporte Constancia</h2><p>Hola '+hello+',</p><p>Respondimos tu consulta:</p><div style="padding:16px;background:#f3f6f3;border-radius:10px;white-space:pre-wrap">'+esc(message)+'</div><p style="margin-top:20px"><a href="https://constancia-nu.vercel.app/login">Entrar a Constancia</a></p></div>';
  await sendEmail(to,"Respuesta de soporte · Constancia",html).catch(()=>undefined);
 }
 return NextResponse.json({ok:true});
}