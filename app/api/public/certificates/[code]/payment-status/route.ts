import {NextResponse} from "next/server";
import {db} from "@/lib/db";
export async function GET(_request:Request,{params}:{params:Promise<{code:string}>}){
 const{code}=await params;
 const c=await db.certificate.findUnique({where:{code},include:{servicePayments:true}});
 if(!c||c.status==="VOID"||c.totalAmountCents===null)return NextResponse.json({error:"No encontrado"},{status:404});
 const paid=c.servicePayments.reduce((s,p)=>s+p.amountCents,0n);
 const balance=c.totalAmountCents>paid?c.totalAmountCents-paid:0n;
 return NextResponse.json({paymentStatus:balance<=0n?"PAID":paid>0n?"PARTIAL":"PENDING",paidCents:paid.toString(),balanceCents:balance.toString()});
}