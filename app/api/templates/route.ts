import {NextResponse} from "next/server";
import {db} from "@/lib/db";
import {activeOrganization} from "@/lib/org";
import {serviceTemplateSchema} from "@/lib/validation";

const intOrNull=(v:unknown)=>{const n=Number(v);return Number.isFinite(n)&&n>0?Math.round(n):null};
export async function GET(){try{const{organization}=await activeOrganization();const templates=await db.serviceTemplate.findMany({where:{organizationId:organization.id,active:true},orderBy:{name:"asc"}});return NextResponse.json({templates})}catch{return NextResponse.json({error:"No autorizado"},{status:401})}}
export async function POST(request:Request){
  try{const{organization}=await activeOrganization();const input=serviceTemplateSchema.parse(await request.json());const checklist=(input.checklistText||"").split("\n").map(x=>x.trim()).filter(Boolean).slice(0,30);const template=await db.serviceTemplate.create({data:{organizationId:organization.id,name:input.name,category:input.category||null,defaultTitle:input.defaultTitle,defaultDescription:input.defaultDescription,checklist,defaultDurationMinutes:intOrNull(input.defaultDurationMinutes),defaultNextServiceDays:intOrNull(input.defaultNextServiceDays)}});return NextResponse.json({template})}
  catch(error){return NextResponse.json({error:error instanceof Error?error.message:"No se pudo guardar"},{status:400})}
}