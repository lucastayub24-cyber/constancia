import {NextResponse} from "next/server";
import {z} from "zod";
import {db} from "@/lib/db";
import {requireOrgRole} from "@/lib/org";

const schema=z.object({role:z.enum(["OWNER","ADMIN","MEMBER"])});

export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
  try{
    const ctx=await requireOrgRole(["OWNER"]);
    const{id}=await params;
    const input=schema.parse(await request.json());
    const target=await db.membership.findFirst({where:{id,organizationId:ctx.organization.id}});
    if(!target)return NextResponse.json({error:"Miembro no encontrado."},{status:404});
    if(target.userId===ctx.user.id&&target.role==="OWNER"&&input.role!=="OWNER"){
      const owners=await db.membership.count({where:{organizationId:ctx.organization.id,role:"OWNER"}});
      if(owners<=1)return NextResponse.json({error:"La empresa debe conservar al menos un propietario."},{status:400});
    }
    if(target.role==="OWNER"&&input.role!=="OWNER"){
      const owners=await db.membership.count({where:{organizationId:ctx.organization.id,role:"OWNER"}});
      if(owners<=1)return NextResponse.json({error:"La empresa debe conservar al menos un propietario."},{status:400});
    }
    await db.membership.update({where:{id},data:{role:input.role}});
    return NextResponse.json({ok:true});
  }catch(error){return NextResponse.json({error:error instanceof Error?error.message:"No se pudo cambiar el rol"},{status:400})}
}

export async function DELETE(_:Request,{params}:{params:Promise<{id:string}>}){
  try{
    const ctx=await requireOrgRole(["OWNER","ADMIN"]);
    const{id}=await params;
    const target=await db.membership.findFirst({where:{id,organizationId:ctx.organization.id}});
    if(!target)return NextResponse.json({error:"Miembro no encontrado."},{status:404});
    if(target.userId===ctx.user.id)return NextResponse.json({error:"No podés quitarte desde esta pantalla."},{status:400});
    if(ctx.membership.role!=="OWNER"&&target.role!=="MEMBER")return NextResponse.json({error:"Solo un propietario puede quitar administradores o propietarios."},{status:403});
    if(target.role==="OWNER"){
      const owners=await db.membership.count({where:{organizationId:ctx.organization.id,role:"OWNER"}});
      if(owners<=1)return NextResponse.json({error:"La empresa debe conservar al menos un propietario."},{status:400});
    }
    await db.$transaction(async tx=>{
      await tx.membership.delete({where:{id}});
      const user=await tx.user.findUnique({where:{id:target.userId}});
      if(user?.activeOrganizationId===ctx.organization.id){
        const next=await tx.membership.findFirst({where:{userId:target.userId},select:{organizationId:true}});
        await tx.user.update({where:{id:target.userId},data:{activeOrganizationId:next?.organizationId??null}});
      }
    });
    return NextResponse.json({ok:true});
  }catch(error){return NextResponse.json({error:error instanceof Error?error.message:"No se pudo quitar el miembro"},{status:400})}
}
