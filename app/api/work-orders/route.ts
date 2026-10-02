import {NextResponse} from "next/server";
import {db} from "@/lib/db";
import {activeOrganization} from "@/lib/org";
import {workOrderSchema} from "@/lib/validation";
import {sendPushToOrganization,sendPushToUser} from "@/lib/push";

export async function GET(){
  try{const{organization}=await activeOrganization();const workOrders=await db.workOrder.findMany({where:{organizationId:organization.id},include:{client:true,asset:true,assignedUser:true,certificate:true},orderBy:[{scheduledStart:"asc"},{createdAt:"desc"}],take:300});return NextResponse.json({workOrders})}
  catch{return NextResponse.json({error:"No autorizado"},{status:401})}
}
export async function POST(request:Request){
  try{
    const{organization,user}=await activeOrganization();const input=workOrderSchema.parse(await request.json());
    const client=await db.client.findFirst({where:{id:input.clientId,organizationId:organization.id}});if(!client)return NextResponse.json({error:"Cliente inválido"},{status:400});
    const asset=input.assetId?await db.asset.findFirst({where:{id:input.assetId,organizationId:organization.id,clientId:client.id}}):null;if(input.assetId&&!asset)return NextResponse.json({error:"Activo inválido"},{status:400});
    const template=input.templateId?await db.serviceTemplate.findFirst({where:{id:input.templateId,organizationId:organization.id,active:true}}):null;
    if(input.assignedUserId){const member=await db.membership.findUnique({where:{organizationId_userId:{organizationId:organization.id,userId:input.assignedUserId}}});if(!member)return NextResponse.json({error:"Técnico inválido"},{status:400})}
    const last=await db.workOrder.findFirst({where:{organizationId:organization.id},orderBy:{sequentialNumber:"desc"},select:{sequentialNumber:true}});
    const workOrder=await db.workOrder.create({data:{
      organizationId:organization.id,sequentialNumber:(last?.sequentialNumber??0)+1,clientId:client.id,assetId:asset?.id||null,templateId:template?.id||null,
      createdByUserId:user.id,assignedUserId:input.assignedUserId||null,priority:input.priority,
      title:input.title||template?.defaultTitle||"Servicio",description:input.description||template?.defaultDescription||"Trabajo programado",
      serviceAddress:input.serviceAddress||client.address,
      scheduledStart:input.scheduledStart?new Date(input.scheduledStart):null,scheduledEnd:input.scheduledEnd?new Date(input.scheduledEnd):null,
      internalNotes:input.internalNotes||null
    }});
    if(workOrder.scheduledStart){
      const when=workOrder.scheduledStart.toLocaleString("es-AR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit",timeZone:"America/Argentina/Buenos_Aires"});
      await db.notification.create({data:{organizationId:organization.id,userId:workOrder.assignedUserId||null,type:"WORK_ORDER",title:"Trabajo agendado",body:"OT-"+String(workOrder.sequentialNumber).padStart(5,"0")+" · "+workOrder.title+" · "+when,href:"/dashboard/orden/"+workOrder.id}}).catch(()=>undefined);
      const payload={title:"Trabajo agendado",body:client.name+" · "+workOrder.title+" · "+when,href:"/dashboard/orden/"+workOrder.id,tag:"work-order-"+workOrder.id};
      if(workOrder.assignedUserId)await sendPushToUser(workOrder.assignedUserId,payload).catch(()=>undefined);
      else await sendPushToOrganization(organization.id,payload).catch(()=>undefined);
    }
    return NextResponse.json({workOrder});
  }catch(error){return NextResponse.json({error:error instanceof Error?error.message:"No se pudo crear la orden"},{status:400})}
}