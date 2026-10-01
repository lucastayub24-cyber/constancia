import {NextResponse} from "next/server";
import {activeOrganization} from "@/lib/org";
import {db} from "@/lib/db";
import {DEMO_MARKER} from "@/lib/demo-data";

export async function DELETE(){
  try{
    const{organization}=await activeOrganization();
    const demoClients=await db.client.findMany({
      where:{organizationId:organization.id,notes:{contains:DEMO_MARKER}},
      select:{id:true},
    });
    const clientIds=demoClients.map(x=>x.id);
    await db.$transaction(async tx=>{
      await tx.certificate.deleteMany({where:{organizationId:organization.id,observations:{contains:DEMO_MARKER}}});
      if(clientIds.length)await tx.client.deleteMany({where:{organizationId:organization.id,id:{in:clientIds}}});
      await tx.serviceTemplate.deleteMany({where:{organizationId:organization.id,name:{contains:"Demo"}}});
      await tx.notification.deleteMany({where:{organizationId:organization.id,OR:[
        {title:"Tu espacio demo ya está listo"},
        {body:{contains:"ejemplo"}},
      ]}});
    });
    return NextResponse.json({ok:true});
  }catch(error){
    return NextResponse.json({error:error instanceof Error?error.message:"No se pudieron borrar los ejemplos."},{status:400});
  }
}
