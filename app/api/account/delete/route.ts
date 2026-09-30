import {NextResponse} from "next/server";
import {compare} from "bcryptjs";
import {z} from "zod";
import {db} from "@/lib/db";
import {clearSession,requireUser} from "@/lib/auth";
import {cancelSubscription} from "@/lib/mercadopago";

const schema=z.object({password:z.string().min(1),confirmation:z.literal("ELIMINAR")});

export async function POST(request:Request){
  try{
    const user=await requireUser();
    const input=schema.parse(await request.json());
    if(!(await compare(input.password,user.passwordHash)))return NextResponse.json({error:"La contraseña es incorrecta."},{status:403});

    const owned=await db.membership.findMany({
      where:{userId:user.id,role:"OWNER"},
      include:{organization:{include:{memberships:true}}}
    });
    const organizationsToDelete=owned.filter(m=>!m.organization.memberships.some(other=>other.userId!==user.id&&other.role==="OWNER"));

    for(const membership of organizationsToDelete){
      const org=membership.organization;
      if(org.mpSubscriptionId&&["ACTIVE","PENDING","PAUSED"].includes(org.subscriptionStatus)){
        await cancelSubscription(org.mpSubscriptionId);
      }
    }

    await db.$transaction(async tx=>{
      for(const membership of organizationsToDelete){
        await tx.organization.delete({where:{id:membership.organizationId}});
      }
      await tx.user.delete({where:{id:user.id}});
    });
    await clearSession();
    return NextResponse.json({ok:true});
  }catch(error){
    return NextResponse.json({error:error instanceof Error?error.message:"No se pudo eliminar la cuenta"},{status:400});
  }
}
