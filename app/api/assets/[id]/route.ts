import {NextResponse} from "next/server";
import {db} from "@/lib/db";
import {activeOrganization} from "@/lib/org";
import {assetSchema} from "@/lib/validation";

export async function PUT(request:Request,{params}:{params:Promise<{id:string}>}){
  try{
    const{id}=await params;const{organization}=await activeOrganization();const input=assetSchema.parse(await request.json());
    const current=await db.asset.findFirst({where:{id,organizationId:organization.id}});if(!current)return NextResponse.json({error:"No encontrado"},{status:404});
    const client=await db.client.findFirst({where:{id:input.clientId,organizationId:organization.id}});if(!client)return NextResponse.json({error:"Cliente inválido"},{status:400});
    const asset=await db.asset.update({where:{id},data:{clientId:client.id,name:input.name,category:input.category||null,brand:input.brand||null,model:input.model||null,serialNumber:input.serialNumber||null,location:input.location||null,notes:input.notes||null,installedAt:input.installedAt?new Date(input.installedAt+"T12:00:00Z"):null,warrantyUntil:input.warrantyUntil?new Date(input.warrantyUntil+"T12:00:00Z"):null}});
    return NextResponse.json({asset});
  }catch(error){return NextResponse.json({error:error instanceof Error?error.message:"No se pudo actualizar"},{status:400})}
}
export async function DELETE(_:Request,{params}:{params:Promise<{id:string}>}){
  try{
    const{id}=await params;const{organization}=await activeOrganization();const asset=await db.asset.findFirst({where:{id,organizationId:organization.id}});if(!asset)return NextResponse.json({error:"No encontrado"},{status:404});
    await db.asset.update({where:{id},data:{status:"RETIRED"}});return NextResponse.json({ok:true});
  }catch{return NextResponse.json({error:"No se pudo retirar"},{status:400})}
}