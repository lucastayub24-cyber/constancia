import {NextResponse} from "next/server";
import {activeOrganization} from "@/lib/org";
import {db} from "@/lib/db";
import {createDemoWorkspace,DEMO_MARKER} from "@/lib/demo-data";

export async function POST(){
  try{
    const{organization,user}=await activeOrganization();
    const exists=await db.client.findFirst({where:{organizationId:organization.id,notes:{contains:DEMO_MARKER}},select:{id:true}});
    if(exists)return NextResponse.json({ok:true,alreadyExists:true});
    const result=await db.$transaction(tx=>createDemoWorkspace(tx,{organizationId:organization.id,userId:user.id}));
    return NextResponse.json({ok:true,...result});
  }catch(error){
    return NextResponse.json({error:error instanceof Error?error.message:"No se pudo crear el ejemplo."},{status:400});
  }
}
