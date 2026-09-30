import {NextResponse} from "next/server";
import {compare} from "bcryptjs";
import {z} from "zod";
import {db} from "@/lib/db";
import {clearSession,requireUser} from "@/lib/auth";
import {cancelSubscription} from "@/lib/mercadopago";
import {deleteStoredObjects} from "@/lib/storage";

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
    const organizationIds=organizationsToDelete.map(m=>m.organizationId);

    for(const membership of organizationsToDelete){
      const org=membership.organization;
      if(org.mpSubscriptionId&&["ACTIVE","PENDING","PAUSED","PAYMENT_FAILED"].includes(org.subscriptionStatus)){
        await cancelSubscription(org.mpSubscriptionId);
      }
    }

    if(organizationIds.length){
      const photos=await db.certificatePhoto.findMany({
        where:{certificate:{organizationId:{in:organizationIds}}},
        select:{storageKey:true}
      });
      if(photos.length)await deleteStoredObjects(photos.map(p=>p.storageKey));
    }

    await db.$transaction(async tx=>{
      for(const organizationId of organizationIds)await tx.organization.delete({where:{id:organizationId}});
      await tx.user.delete({where:{id:user.id}});
    });
    await clearSession();
    return NextResponse.json({ok:true});
  }catch(error){
    return NextResponse.json({error:error instanceof Error?error.message:"No se pudo eliminar la cuenta"},{status:400});
  }
}
