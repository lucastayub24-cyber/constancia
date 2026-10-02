import {NextResponse} from "next/server";
import {db} from "@/lib/db";
import {currentUser} from "@/lib/auth";
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
 const user=await currentUser();if(!user||user.role!=="ADMIN")return NextResponse.json({error:"UNAUTHORIZED"},{status:401});
 const{id}=await params;const body=await request.json();const message=String(body.message||"").trim().slice(0,3000);
 if(message.length<2)return NextResponse.json({error:"Escribí una respuesta."},{status:400});
 const thread=await db.supportThread.findUnique({where:{id},select:{id:true}});if(!thread)return NextResponse.json({error:"No encontrado"},{status:404});
 const m=await db.supportMessage.create({data:{threadId:id,sender:"ADMIN",senderUserId:user.id,body:message}});
 await db.supportThread.update({where:{id},data:{lastMessageAt:m.createdAt,status:"WAITING_USER"}});
 return NextResponse.json({ok:true});
}