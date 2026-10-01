import {randomUUID} from "crypto";
import type {Prisma} from "@prisma/client";

export const DEMO_MARKER="[CONSTANCIA_DEMO]";

function demoPhoto(label:string,variant:"before"|"during"|"after"){
  const bg=variant==="before"?"#d7d2c8":variant==="during"?"#cfd9d2":"#dce8df";
  const accent=variant==="before"?"#8a725f":variant==="during"?"#3f7658":"#247a50";
  const note=variant==="before"?"Estado inicial":variant==="during"?"Trabajo en proceso":"Equipo finalizado";
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800"><rect width="1200" height="800" fill="${bg}"/><rect x="90" y="110" width="1020" height="570" rx="28" fill="#eef0eb"/><rect x="165" y="260" width="570" height="265" rx="24" fill="#5e6a61"/><rect x="205" y="305" width="355" height="175" rx="16" fill="#87958a"/><circle cx="655" cy="455" r="86" fill="#3c4940"/><circle cx="655" cy="455" r="48" fill="#b7c1b8"/><rect x="760" y="210" width="210" height="315" rx="22" fill="${accent}"/><rect x="805" y="260" width="120" height="74" rx="10" fill="#e9eee9"/><path d="M250 570h690" stroke="#aab2aa" stroke-width="18" stroke-linecap="round"/><circle cx="255" cy="178" r="10" fill="${accent}"/><text x="282" y="188" fill="#263129" font-family="Arial,sans-serif" font-size="32" font-weight="700">${label}</text><text x="165" y="635" fill="#667068" font-family="Arial,sans-serif" font-size="25">${note} · Evidencia demo de Constancia</text></svg>`;
  return "data:image/svg+xml;charset=utf-8,"+encodeURIComponent(svg);
}

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
    photos:{create:[
      {stage:"BEFORE",sortOrder:0,storageKey:demoPhoto("ANTES · Vista general","before")},
      {stage:"BEFORE",sortOrder:1,storageKey:demoPhoto("ANTES · Filtro","before")},
      {stage:"DURING",sortOrder:0,storageKey:demoPhoto("DURANTE · Desarme","during")},
      {stage:"DURING",sortOrder:1,storageKey:demoPhoto("DURANTE · Reemplazo","during")},
      {stage:"AFTER",sortOrder:0,storageKey:demoPhoto("DESPUÉS · Equipo limpio","after")},
      {stage:"AFTER",sortOrder:1,storageKey:demoPhoto("DESPUÉS · Prueba OK","after")},
    ]},
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
    photos:{create:[
      {sortOrder:0,label:"Antes",storageKey:demoPhoto("ANTES · Equipo","before")},
      {sortOrder:1,label:"Durante",storageKey:demoPhoto("DURANTE · Service","during")},
      {sortOrder:2,label:"Después",storageKey:demoPhoto("DESPUÉS · Final","after")},
    ]},
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
