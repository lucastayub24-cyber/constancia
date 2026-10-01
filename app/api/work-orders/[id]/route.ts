import {NextResponse} from "next/server";
import {db} from "@/lib/db";
import {activeOrganization} from "@/lib/org";

const allowed=["SCHEDULED","EN_ROUTE","IN_PROGRESS","WAITING_PART","COMPLETED","CANCELED"] as const;
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
  try{
    const{id}=await params;const{organization}=await activeOrganization();const body=await request.json();const status=String(body.status||"");
    if(!allowed.includes(status as typeof allowed[number]))return NextResponse.json({error:"Estado inválido"},{status:400});
    if(status==="COMPLETED")return NextResponse.json({error:"Finalizá la orden desde Ejecución en campo para validar checklist, GPS y evidencia."},{status:400});
    const current=await db.workOrder.findFirst({where:{id,organizationId:organization.id}});if(!current)return NextResponse.json({error:"No encontrada"},{status:404});
    const data:{status:typeof allowed[number];startedAt?:Date;completedAt?:Date}={status:status as typeof allowed[number]};
    if(status==="IN_PROGRESS"&&!current.startedAt)data.startedAt=new Date();
    if(status==="COMPLETED"&&!current.completedAt)data.completedAt=new Date();
    const workOrder=await db.workOrder.update({where:{id},data});return NextResponse.json({workOrder});
  }catch(error){return NextResponse.json({error:error instanceof Error?error.message:"No se pudo actualizar"},{status:400})}
}