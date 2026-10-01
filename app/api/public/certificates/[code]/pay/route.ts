import {NextResponse} from "next/server";
import {db} from "@/lib/db";
import {createSellerPaymentPreference} from "@/lib/mp-seller";
import {consumeRateLimit,RateLimitError} from "@/lib/rate-limit";

export async function POST(request:Request,{params}:{params:Promise<{code:string}>}){
 try{
  const{code}=await params;
  await consumeRateLimit(request,"public-mp-pay",code,10,15*60*1000);
  const c=await db.certificate.findUnique({where:{code},include:{client:true,organization:true,servicePayments:true}});
  if(!c||c.status!=="ISSUED"||c.totalAmountCents===null)return NextResponse.json({error:"Constancia no disponible para cobro."},{status:404});
  if(!c.organization.mpSellerConnectedAt||!c.organization.mpSellerAccessTokenEnc)return NextResponse.json({error:"El profesional todavía no habilitó Mercado Pago."},{status:400});
  const paid=c.servicePayments.reduce((s,p)=>s+p.amountCents,0n);
  const balance=c.totalAmountCents>paid?c.totalAmountCents-paid:0n;
  if(balance<=0n)return NextResponse.json({error:"Esta constancia ya está pagada."},{status:400});
  const pref=await createSellerPaymentPreference({
   organizationId:c.organizationId,certificateId:c.id,certificateCode:c.code,title:c.serviceTitle,
   amount:Number(balance)/100,currency:c.currency,payerEmail:c.client?.email
  });
  return NextResponse.json({url:pref.init_point});
 }catch(error){
  if(error instanceof RateLimitError)return NextResponse.json({error:error.message},{status:429});
  return NextResponse.json({error:error instanceof Error?error.message:"No se pudo iniciar el pago."},{status:400});
 }
}