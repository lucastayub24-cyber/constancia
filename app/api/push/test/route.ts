import {NextResponse} from "next/server";
import {currentUser} from "@/lib/auth";
import {sendPushToUser} from "@/lib/push";
export async function POST(){
 const user=await currentUser();if(!user)return NextResponse.json({error:"UNAUTHORIZED"},{status:401});
 const sent=await sendPushToUser(user.id,{title:"Constancia lista",body:"Las notificaciones del dispositivo están activadas.",href:"/dashboard/notificaciones",tag:"push-test"});
 return NextResponse.json({ok:true,sent});
}