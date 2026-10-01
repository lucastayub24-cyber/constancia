import {NextResponse} from "next/server";
import {randomUUID} from "crypto";
import {db} from "@/lib/db";
import {activeOrganization} from "@/lib/org";
import {assetSchema} from "@/lib/validation";

export async function GET(){
  try{
    const{organization}=await activeOrganization();
    const assets=await db.asset.findMany({where:{organizationId:organization.id},include:{client:true,_count:{select:{certificates:true,workOrders:true}}},orderBy:[{status:"asc"},{name:"asc"}]});
    return NextResponse.json({assets});
  }catch{return NextResponse.json({error:"No autorizado"},{status:401})}
}
export async function POST(request:Request){
  try{
    const{organization}=await activeOrganization();
    const input=assetSchema.parse(await request.json());
    const client=await db.client.findFirst({where:{id:input.clientId,organizationId:organization.id}});
    if(!client)return NextResponse.json({error:"Cliente inválido"},{status:400});
    const last=await db.asset.findFirst({where:{organizationId:organization.id},orderBy:{assetNumber:"desc"},select:{assetNumber:true}});
    const asset=await db.asset.create({data:{
      organizationId:organization.id,clientId:client.id,assetNumber:(last?.assetNumber??0)+1,
      publicCode:randomUUID().replace(/-/g,"").slice(0,24),
      name:input.name,category:input.category||null,brand:input.brand||null,model:input.model||null,
      serialNumber:input.serialNumber||null,location:input.location||null,notes:input.notes||null,
      installedAt:input.installedAt?new Date(input.installedAt+"T12:00:00Z"):null,
      warrantyUntil:input.warrantyUntil?new Date(input.warrantyUntil+"T12:00:00Z"):null
    }});
    return NextResponse.json({asset});
  }catch(error){return NextResponse.json({error:error instanceof Error?error.message:"No se pudo guardar"},{status:400})}
}