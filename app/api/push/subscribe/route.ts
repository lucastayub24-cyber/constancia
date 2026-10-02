import {NextResponse} from "next/server";
import {currentUser} from "@/lib/auth";
import {db} from "@/lib/db";
import {pushPublicKey} from "@/lib/push";

export async function GET(){
 const user=await currentUser();if(!user)return NextResponse.json({error:"UNAUTHORIZED"},{status:401});
 return NextResponse.json({publicKey:pushPublicKey()});
}
export async function POST(request:Request){
 const user=await currentUser();if(!user)return NextResponse.json({error:"UNAUTHORIZED"},{status:401});
 if(!user.activeOrganizationId)return NextResponse.json({error:"Sin organización activa"},{status:400});
 const body=await request.json();const endpoint=String(body.endpoint||"");const p256dh=String(body.keys?.p256dh||"");const auth=String(body.keys?.auth||"");
 if(!endpoint||!p256dh||!auth)return NextResponse.json({error:"Suscripción inválida"},{status:400});
 await db.pushSubscription.upsert({where:{endpoint},create:{userId:user.id,organizationId:user.activeOrganizationId,endpoint,p256dh,auth,userAgent:request.headers.get("user-agent")},update:{userId:user.id,organizationId:user.activeOrganizationId,p256dh,auth,userAgent:request.headers.get("user-agent")}});
 return NextResponse.json({ok:true});
}
export async function DELETE(request:Request){
 const user=await currentUser();if(!user)return NextResponse.json({error:"UNAUTHORIZED"},{status:401});
 const body=await request.json().catch(()=>({}));const endpoint=String(body.endpoint||"");
 if(endpoint)await db.pushSubscription.deleteMany({where:{endpoint,userId:user.id}});
 else await db.pushSubscription.deleteMany({where:{userId:user.id}});
 return NextResponse.json({ok:true});
}
