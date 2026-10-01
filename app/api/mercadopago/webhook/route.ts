import {db} from "@/lib/db";
import {getAuthorizedPayment,getPayment,getSubscription,validMpSignature} from "@/lib/mercadopago";
import {PLAN_INFO} from "@/lib/plans";
import type {Plan} from "@prisma/client";

const paidAt=(value?:string|null)=>value?new Date(value):new Date();

export async function POST(request:Request){
 try{
  const u=new URL(request.url);const body=await request.clone().json().catch(()=>({}));
  const dataId=String(u.searchParams.get("data.id")||u.searchParams.get("data_id")||body?.data?.id||"");
  if(!dataId||!validMpSignature(request,dataId))return new Response("invalid signature",{status:401});
  const type=u.searchParams.get("type")||u.searchParams.get("topic")||body?.type||body?.topic||"";

  if(type==="subscription_preapproval"){
   const x=await getSubscription(dataId);let org=await db.organization.findFirst({where:{mpSubscriptionId:x.id}});
   if(!org&&typeof x.external_reference==="string"&&x.external_reference.startsWith("constancia:")){const[,orgId,planRaw]=x.external_reference.split(":");if(orgId&&["PROFESSIONAL","PRO","BUSINESS"].includes(planRaw)){org=await db.organization.findUnique({where:{id:orgId}});if(org)await db.organization.update({where:{id:org.id},data:{mpSubscriptionId:x.id,plan:planRaw as Plan}})}}
   if(org){const status=x.status==="authorized"?"ACTIVE":x.status==="paused"?"PAUSED":x.status==="cancelled"||x.status==="canceled"?"CANCELED":"PENDING";const plan=org.plan;await db.organization.update({where:{id:org.id},data:{subscriptionStatus:status,subscriptionCurrentEnd:x.next_payment_date?new Date(x.next_payment_date):null,...(status==="ACTIVE"?{monthlyCertificateLimit:PLAN_INFO[plan].certificateLimit}:status==="CANCELED"?{plan:"FREE",monthlyCertificateLimit:5}:{})}})}
  }else if(type==="subscription_authorized_payment"){
   const x=await getAuthorizedPayment(dataId);const org=await db.organization.findFirst({where:{mpSubscriptionId:x.preapproval_id}});
   if(org){const providerId=String(x.payment?.id??x.id);const status=String(x.payment?.status??x.summarized??x.status);await db.subscriptionPayment.upsert({where:{providerPaymentId:providerId},create:{organizationId:org.id,providerPaymentId:providerId,amountCents:BigInt(Math.round(Number(x.transaction_amount)*100)),currency:x.currency_id||"ARS",status,paidAt:status==="approved"?paidAt(x.debit_date):null,raw:x},update:{status,paidAt:status==="approved"?paidAt(x.debit_date):null,raw:x}});if(status==="approved")await db.organization.update({where:{id:org.id},data:{subscriptionStatus:"ACTIVE",monthlyCertificateLimit:PLAN_INFO[org.plan].certificateLimit}})}
  }else if(type==="payment"){
   const x=await getPayment(dataId);const ref=typeof x.external_reference==="string"?x.external_reference:"";const parts=ref.startsWith("constancia:")?ref.split(":"):null;
   if(parts?.[1]==="service"){
    const orgId=parts[2],certificateId=parts[3];const cert=orgId&&certificateId?await db.certificate.findFirst({where:{id:certificateId,organizationId:orgId,status:"ISSUED"}}):null;
    if(cert&&String(x.status)==="approved"){
     const reference="MP "+String(x.id);const exists=await db.certificatePayment.findFirst({where:{certificateId:cert.id,reference}});
     if(!exists)await db.certificatePayment.create({data:{certificateId:cert.id,amountCents:BigInt(Math.round(Number(x.transaction_amount||0)*100)),method:"MERCADO_PAGO",paidAt:paidAt(x.date_approved),reference,notes:"Pago acreditado automáticamente por Mercado Pago."}});
     const agg=await db.certificatePayment.aggregate({where:{certificateId:cert.id},_sum:{amountCents:true}});const totalPaid=agg._sum.amountCents||0n;const paymentStatus=cert.totalAmountCents===null?"NO_AMOUNT":totalPaid>=cert.totalAmountCents?"PAID":totalPaid>0n?"PARTIAL":"PENDING";
     await db.certificate.update({where:{id:cert.id},data:{paymentStatus}});
     await db.notification.create({data:{organizationId:orgId,type:"PAYMENT",title:"Pago acreditado",body:"Mercado Pago acreditó un pago de $"+Number(x.transaction_amount||0).toLocaleString("es-AR")+" en la constancia #"+String(cert.sequentialNumber).padStart(6,"0")+".",href:"/dashboard/constancia/"+cert.id}});
    }
   }else{
    const orgId=parts?.[1];const planRaw=parts?.[2];const org=orgId?await db.organization.findUnique({where:{id:orgId}}):null;
    if(org){const status=String(x.status||"unknown");const plan=["PROFESSIONAL","PRO","BUSINESS"].includes(planRaw||"")?planRaw as Plan:org.plan;await db.subscriptionPayment.upsert({where:{providerPaymentId:String(x.id)},create:{organizationId:org.id,providerPaymentId:String(x.id),amountCents:BigInt(Math.round(Number(x.transaction_amount||0)*100)),currency:x.currency_id||"ARS",status,paidAt:status==="approved"?paidAt(x.date_approved):null,raw:x},update:{status,paidAt:status==="approved"?paidAt(x.date_approved):null,raw:x}});if(status==="approved")await db.organization.update({where:{id:org.id},data:{plan,subscriptionStatus:"ACTIVE",monthlyCertificateLimit:PLAN_INFO[plan].certificateLimit}})}
   }
  }
  return new Response("ok");
 }catch(error){console.error("mp webhook",error);return new Response("error",{status:500})}
}