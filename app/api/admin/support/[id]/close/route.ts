import {NextResponse} from "next/server";
import {db} from "@/lib/db";
import {currentUser} from "@/lib/auth";
export async function POST(_request:Request,{params}:{params:Promise<{id:string}>}){
 const user=await currentUser();if(!user||user.role!=="ADMIN")return NextResponse.json({error:"UNAUTHORIZED"},{status:401});
 const{id}=await params;await db.supportThread.update({where:{id},data:{status:"CLOSED"}});return NextResponse.json({ok:true});
}