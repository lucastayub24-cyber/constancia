import {randomUUID} from "crypto";
import type {Prisma} from "@prisma/client";

export const DEMO_MARKER="[CONSTANCIA_DEMO]";

export async function createDemoWorkspace(tx:Prisma.TransactionClient,input:{organizationId:string;userId:string}){
  const now=new Date();
  const nextService=new Date(now);nextService.setDate(nextService.getDate()+28);
  const nextVisit=new Date(now);nextVisit.setDate(nextVisit.getDate()+14);
  const quoteValid=new Date(now);quoteValid.setDate(quoteValid.getDate()+15);
  const warranty=new Date(now);warranty.setMonth(warranty.getMonth()+6);
  const started=new Date(now.getTime()-105*60*1000);
  const completed=new Date(now.getTime()-25*60*1000);

  const [lastAsset,lastQuote,lastOrder,lastCertificate]=await Promise.all([
    tx.asset.findFirst({where:{organizationId:input.organizationId},orderBy:{assetNumber:"desc"},select:{assetNumber:true}}),
    tx.quote.findFirst({where:{organizationId:input.organizationId},orderBy:{sequentialNumber:"desc"},select:{sequentialNumber:true}}),
    tx.workOrder.findFirst({where:{organizationId:input.organizationId},orderBy:{sequentialNumber:"desc"},select:{sequentialNumber:true}}),
    tx.certificate.findFirst({where:{organizationId:input.organizationId},orderBy:{sequentialNumber:"desc"},select:{sequentialNumber:true}}),
  ]);
  const assetNumber=(lastAsset?.assetNumber??0)+1;
  const quoteNumber=(lastQuote?.sequentialNumber??0)+1;
  const orderNumber=(lastOrder?.sequentialNumber??0)+1;
  const certificateNumber=(lastCertificate?.sequentialNumber??0)+1;

  const client=await tx.client.create({data:{
    organizationId:input.organizationId,
    name:"Metalúrgica Norte · Ejemplo",
    email:"compras@metalurgicanorte.demo",
    phone:"+54 9 11 5555 0198",
    taxId:"30-00000000-0",
    address:"Parque Industrial · Nave 4",
    notes:DEMO_MARKER+" Cliente de ejemplo. Podés editarlo, recorrerlo o borrar todos los datos demo desde el dashboard.",
    portalCode:"demo-"+randomUUID().slice(0,12),
  }});

  const asset=await tx.asset.create({data:{
    organizationId:input.organizationId,clientId:client.id,assetNumber,
    publicCode:"demo-"+randomUUID().slice(0,14),name:"Compresor principal",
    category:"Compresor industrial",brand:"Atlas",model:"GA 15",serialNumber:"AC-845921",
    location:"Planta 1 · Sala de máquinas",notes:DEMO_MARKER+" Activo de ejemplo.",
    installedAt:new Date(now.getFullYear()-2,4,12),warrantyUntil:warranty,
  }});

  const template=await tx.serviceTemplate.create({data:{
    organizationId:input.organizationId,name:"Mantenimiento preventivo · Demo",category:"Mantenimiento",
    defaultTitle:"Mantenimiento preventivo trimestral",
    defaultDescription:"Inspección general, limpieza, control de filtros, ajuste, prueba operativa y registro fotográfico.",
    checklist:["Verificar estado general","Controlar filtro","Revisar conexiones","Prueba operativa","Registrar fotos finales"],
    defaultDurationMinutes:90,defaultNextServiceDays:90,
  }});

  const quote=await tx.quote.create({data:{
    organizationId:input.organizationId,clientId:client.id,sequentialNumber:quoteNumber,status:"APPROVED",
    title:"Service preventivo + cambio de filtro",notes:DEMO_MARKER+" Presupuesto de ejemplo.",validUntil:quoteValid,
    currency:"ARS",totalAmountCents:18500000n,publicCode:"demo-"+randomUUID().slice(0,14),
    items:{create:[
      {description:"Mantenimiento preventivo completo",quantity:1,unitPriceCents:14500000n,sortOrder:0},
      {description:"Filtro de admisión",quantity:1,unitPriceCents:4000000n,sortOrder:1},
    ]}
  }});

  const order=await tx.workOrder.create({data:{
    organizationId:input.organizationId,sequentialNumber:orderNumber,clientId:client.id,assetId:asset.id,templateId:template.id,
    createdByUserId:input.userId,assignedUserId:input.userId,status:"COMPLETED",priority:"NORMAL",
    title:"Mantenimiento preventivo trimestral",description:"Inspección, limpieza, cambio de filtro y prueba final.",
    serviceAddress:client.address,scheduledStart:started,scheduledEnd:completed,startedAt:started,completedAt:completed,
    internalNotes:DEMO_MARKER+" Orden de ejemplo completada.",
    checklistResults:[true,true,true,true,true],
    startLatitude:-34.6037,startLongitude:-58.3816,endLatitude:-34.6037,endLongitude:-58.3816,
    startAccuracyMeters:8,endAccuracyMeters:7,startedUserAgent:"Constancia Demo",completedUserAgent:"Constancia Demo",
    executionNotes:"Equipo en buen estado general. Se reemplazó filtro y la prueba operativa quedó OK.",
    materials:{create:[{name:"Filtro de admisión",quantity:1,unit:"u",unitCostCents:2100000n}]}
  }});

  const certificate=await tx.certificate.create({data:{
    organizationId:input.organizationId,clientId:client.id,assetId:asset.id,workOrderId:order.id,createdByUserId:input.userId,
    sequentialNumber:certificateNumber,code:"demo-"+randomUUID().replace(/-/g,"").slice(0,18),status:"ISSUED",
    serviceTitle:"Mantenimiento preventivo trimestral",
    description:"Se realizó limpieza general, cambio de filtro, control de conexiones y prueba operativa.",
    observations:DEMO_MARKER+" Constancia de ejemplo. Todo este circuito fue creado para que veas cómo se relacionan los módulos.",
    technicianName:"Tu equipo",serviceAddress:client.address,performedAt:completed,nextServiceAt:nextService,warrantyUntil:warranty,
    signatureName:"Juan Pérez · Demo",signatureDocument:"00.000.000",signatureIp:"127.0.0.1",
    signatureUserAgent:"Constancia Demo",customerAcceptedAt:completed,totalAmountCents:18500000n,currency:"ARS",
    paymentStatus:"PARTIAL",paymentDueDate:nextVisit,paymentNotes:DEMO_MARKER+" Cobro de ejemplo.",
  }});

  await tx.certificatePayment.create({data:{
    certificateId:certificate.id,amountCents:9000000n,method:"BANK_TRANSFER",paidAt:completed,
    reference:"DEMO-TRANSFER-001",notes:DEMO_MARKER+" Pago parcial de ejemplo.",createdByUserId:input.userId,
  }});

  await tx.maintenanceContract.create({data:{
    organizationId:input.organizationId,clientId:client.id,assetId:asset.id,name:"Abono preventivo trimestral",
    status:"ACTIVE",frequencyDays:90,startAt:now,nextVisitAt:nextVisit,monthlyAmountCents:6500000n,
    notes:DEMO_MARKER+" Contrato recurrente de ejemplo.",
  }});

  await tx.notification.create({data:{
    organizationId:input.organizationId,userId:input.userId,type:"SYSTEM",
    title:"Tu espacio demo ya está listo",body:"Recorré el cliente, el activo, la orden, la constancia, el presupuesto y el cobro de ejemplo. Después podés borrar todo desde el dashboard.",
    href:"/dashboard",
  }});

  return {clientId:client.id,assetId:asset.id,quoteId:quote.id,orderId:order.id,certificateId:certificate.id};
}
