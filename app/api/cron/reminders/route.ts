import {NextResponse} from "next/server";import {db} from "@/lib/db";import {sendEmail} from "@/lib/email";import {appUrl} from "@/lib/utils";import {sendPushToOrganization,sendPushToUser} from "@/lib/push";

function authorized(request:Request){const secret=process.env.CRON_SECRET;if(!secret)return false;return request.headers.get("authorization")==="Bearer "+secret}

export async function GET(request:Request){
 if(!authorized(request))return NextResponse.json({error:"Unauthorized"},{status:401});
 const now=new Date();const until=new Date(now.getTime()+7*86400000);const orderHorizon=new Date(now.getTime()+86400000);
 const contracts=await db.maintenanceContract.findMany({
  where:{status:"ACTIVE",nextVisitAt:{lte:orderHorizon},OR:[{endAt:null},{endAt:{gte:now}}]},
  include:{client:true,asset:true,organization:{include:{memberships:{orderBy:{createdAt:"asc"},take:1}}}},
  orderBy:{nextVisitAt:"asc"},take:150
 });
 let generatedOrders=0;
 for(const c of contracts){
  const creator=c.organization.memberships[0]?.userId;if(!creator||!c.nextVisitAt)continue;
  await db.$transaction(async tx=>{
   const existing=await tx.workOrder.findFirst({where:{organizationId:c.organizationId,clientId:c.clientId,assetId:c.assetId||null,title:c.name,scheduledStart:c.nextVisitAt!}});
   if(!existing){
    const last=await tx.workOrder.findFirst({where:{organizationId:c.organizationId},orderBy:{sequentialNumber:"desc"},select:{sequentialNumber:true}});
    const order=await tx.workOrder.create({data:{organizationId:c.organizationId,sequentialNumber:(last?.sequentialNumber??0)+1,clientId:c.clientId,assetId:c.assetId,createdByUserId:creator,status:"SCHEDULED",priority:"NORMAL",title:c.name,description:c.notes||"Visita generada automáticamente desde contrato de mantenimiento.",serviceAddress:c.client.address,scheduledStart:c.nextVisitAt}});
    await tx.notification.create({data:{organizationId:c.organizationId,type:"WORK_ORDER",title:"Orden automática creada",body:"Se generó OT-"+String(order.sequentialNumber).padStart(5,"0")+" desde el contrato "+c.name+".",href:"/dashboard/orden/"+order.id}});
    generatedOrders++;
   }
   const next=new Date(c.nextVisitAt!);next.setDate(next.getDate()+c.frequencyDays);
   await tx.maintenanceContract.update({where:{id:c.id},data:{nextVisitAt:next}});
  });
 }
 const upcomingOrders=await db.workOrder.findMany({where:{status:{notIn:["COMPLETED","CANCELED"]},scheduledStart:{gte:now,lte:orderHorizon}},include:{client:true},take:250});
 for(const o of upcomingOrders){const due=o.scheduledStart!.toLocaleString("es-AR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit",timeZone:"America/Argentina/Buenos_Aires"});const payload={title:"Trabajo próximo",body:o.client.name+" · "+o.title+" · "+due,href:"/dashboard/orden/"+o.id,tag:"reminder-order-"+o.id};if(o.assignedUserId)await sendPushToUser(o.assignedUserId,payload).catch(()=>undefined);else await sendPushToOrganization(o.organizationId,payload).catch(()=>undefined)}
 const certificates=await db.certificate.findMany({where:{status:"ISSUED",nextServiceAt:{gte:now,lte:until},reminderSentAt:null,organization:{plan:{in:["PRO","BUSINESS"]}}},include:{organization:true,client:true},take:250});
 let sent=0,skipped=0;
 for(const c of certificates){const target=c.organization.email;const clientName=c.client?.name||"tu cliente";const due=c.nextServiceAt!.toLocaleDateString("es-AR");if(target){await sendEmail(target,"Próximo service: "+clientName+" · "+due,"<p>Tenés un próximo service programado.</p><p><b>Cliente:</b> "+clientName+"<br/><b>Trabajo anterior:</b> "+c.serviceTitle+"<br/><b>Fecha sugerida:</b> "+due+"</p><p><a href=\""+appUrl("/dashboard/constancia/"+c.id)+"\">Abrir constancia</a></p>").catch(()=>undefined)}else skipped++;await sendPushToOrganization(c.organizationId,{title:"Próximo service",body:clientName+" · "+c.serviceTitle+" · "+due,href:"/dashboard/constancia/"+c.id,tag:"service-"+c.id}).catch(()=>undefined);await db.certificate.update({where:{id:c.id},data:{reminderSentAt:new Date()}});sent++}
 return NextResponse.json({ok:true,generatedOrders,upcomingOrderPushes:upcomingOrders.length,serviceReminders:{found:certificates.length,sent,skipped}});
}