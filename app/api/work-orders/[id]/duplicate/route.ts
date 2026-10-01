import {NextResponse} from "next/server";
import {activeOrganization} from "@/lib/org";
import {db} from "@/lib/db";

export async function POST(_request:Request,{params}:{params:Promise<{id:string}>}){
  try{
    const{id}=await params;
    const{organization,user}=await activeOrganization();
    const source=await db.workOrder.findFirst({
      where:{id,organizationId:organization.id},
      include:{materials:true},
    });
    if(!source)return NextResponse.json({error:"Orden no encontrada"},{status:404});

    const last=await db.workOrder.findFirst({
      where:{organizationId:organization.id},
      orderBy:{sequentialNumber:"desc"},
      select:{sequentialNumber:true},
    });

    const copy=await db.workOrder.create({
      data:{
        organizationId:organization.id,
        sequentialNumber:(last?.sequentialNumber??0)+1,
        clientId:source.clientId,
        assetId:source.assetId,
        templateId:source.templateId,
        createdByUserId:user.id,
        assignedUserId:source.assignedUserId,
        status:"SCHEDULED",
        priority:source.priority,
        title:source.title,
        description:source.description,
        serviceAddress:source.serviceAddress,
        internalNotes:[source.internalNotes,"Duplicada de OT-"+String(source.sequentialNumber).padStart(5,"0")].filter(Boolean).join("\n"),
        materials:{
          create:source.materials.map(m=>({
            name:m.name,
            quantity:m.quantity,
            unit:m.unit,
            unitCostCents:m.unitCostCents,
          })),
        },
      },
    });
    return NextResponse.json({id:copy.id});
  }catch(error){
    return NextResponse.json({error:error instanceof Error?error.message:"No se pudo duplicar la orden"},{status:400});
  }
}
