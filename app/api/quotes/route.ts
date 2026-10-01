import {NextResponse} from "next/server";
import {randomUUID} from "crypto";
import {z} from "zod";
import {db} from "@/lib/db";
import {activeOrganization} from "@/lib/org";
import {cents} from "@/lib/utils";

const schema=z.object({
  clientId:z.string().min(1),
  title:z.string().trim().min(3).max(180),
  notes:z.string().trim().max(3000).optional(),
  validUntil:z.string().optional().or(z.literal("")),
  items:z.array(z.object({description:z.string().trim().min(1).max(300),quantity:z.coerce.number().positive(),unitPrice:z.union([z.string(),z.number()])})).min(1).max(30)
});
export async function GET(){try{const{organization}=await activeOrganization();const quotes=await db.quote.findMany({where:{organizationId:organization.id},include:{client:true,items:true},orderBy:{createdAt:"desc"},take:200});return NextResponse.json({quotes:quotes.map(q=>({...q,totalAmountCents:q.totalAmountCents.toString(),items:q.items.map(i=>({...i,unitPriceCents:i.unitPriceCents.toString(),quantity:i.quantity.toString()}))}))})}catch{return NextResponse.json({error:"No autorizado"},{status:401})}}
export async function POST(request:Request){
 try{const{organization}=await activeOrganization();const input=schema.parse(await request.json());const client=await db.client.findFirst({where:{id:input.clientId,organizationId:organization.id}});if(!client)return NextResponse.json({error:"Cliente inválido"},{status:400});const parsed=input.items.map((i,n)=>{const price=cents(i.unitPrice);if(price===null||price<0n)throw new Error("Precio inválido");const qty=Math.round(i.quantity*1000)/1000;return{description:i.description,quantity:qty,unitPriceCents:price,sortOrder:n}});const total=parsed.reduce((sum,i)=>sum+BigInt(Math.round(i.quantity*1000))*i.unitPriceCents/1000n,0n);const last=await db.quote.findFirst({where:{organizationId:organization.id},orderBy:{sequentialNumber:"desc"},select:{sequentialNumber:true}});const quote=await db.quote.create({data:{organizationId:organization.id,clientId:client.id,sequentialNumber:(last?.sequentialNumber??0)+1,publicCode:randomUUID().replace(/-/g,"").slice(0,24),title:input.title,notes:input.notes||null,validUntil:input.validUntil?new Date(input.validUntil+"T12:00:00Z"):null,totalAmountCents:total,items:{create:parsed}}});return NextResponse.json({id:quote.id,code:quote.publicCode})}
 catch(error){return NextResponse.json({error:error instanceof Error?error.message:"No se pudo crear"},{status:400})}
}