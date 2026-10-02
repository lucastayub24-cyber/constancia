import {NextResponse} from "next/server";
import {db} from "@/lib/db";
import {currentUser} from "@/lib/auth";
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){
 const user=await currentUser();if(!user)return NextResponse.json({error:"UNAUTHORIZED"},{status:401});
 const{id}=await params;
 const thread=await db.supportThread.findFirst({where:{id,userId:user.id},include:{messages:{orderBy:{createdAt:"asc"},take:100}}});
 if(!thread)return NextResponse.json({error:"No encontrado"},{status:404});
 await db.supportMessage.updateMany({where:{threadId:id,sender:"ADMIN",readAt:null},data:{readAt:new Date()}});
 return NextResponse.json({thread});
}