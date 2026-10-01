import {NextResponse} from "next/server";
import {db} from "@/lib/db";
import {activeOrganization} from "@/lib/org";

type Stage="BEFORE"|"DURING"|"AFTER";
const stages:Stage[]=["BEFORE","DURING","AFTER"];
const cleanNumber=(v:unknown)=>typeof v==="number"&&Number.isFinite(v)?v:null;

export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
  try{
    const{id}=await params;
    const{organization}=await activeOrganization();
    const body=await request.json();
    const current=await db.workOrder.findFirst({where:{id,organizationId:organization.id},include:{template:true}});
    if(!current)return NextResponse.json({error:"Orden no encontrada"},{status:404});

    const action=String(body.action||"SAVE");
    const checklist=Array.isArray(body.checklist)?body.checklist.map((x:unknown)=>Boolean(x)):[];
    const required=Array.isArray(current.template?.checklist)?current.template.checklist.length:0;
    if(action==="COMPLETE"&&required>0&&(checklist.length<required||checklist.slice(0,required).some((x:boolean)=>!x))){
      return NextResponse.json({error:"Completá todo el checklist antes de cerrar el trabajo."},{status:400});
    }

    const photos=body.photos&&typeof body.photos==="object"?body.photos as Record<string,unknown>:{};
    const photoRows:{storageKey:string;stage:Stage;sortOrder:number}[]=[];
    for(const stage of stages){
      const items=Array.isArray(photos[stage])?photos[stage] as unknown[]:[];
      items.slice(0,8).forEach((key,i)=>{if(typeof key==="string"&&key.length<=500000)photoRows.push({storageKey:key,stage,sortOrder:i})});
    }
    const data:{
      checklistResults:boolean[];
      executionNotes:string|null;
      startLatitude?:number|null;startLongitude?:number|null;startAccuracyMeters?:number|null;
      endLatitude?:number|null;endLongitude?:number|null;endAccuracyMeters?:number|null;
      startedAt?:Date;completedAt?:Date;status?:"IN_PROGRESS"|"COMPLETED";
      startedUserAgent?:string|null;completedUserAgent?:string|null;
    }={checklistResults:checklist,executionNotes:typeof body.notes==="string"?body.notes.slice(0,5000)||null:null};

    const ua=request.headers.get("user-agent");
    if(action==="START"){
      data.status="IN_PROGRESS";data.startedAt=current.startedAt||new Date();
      data.startLatitude=cleanNumber(body.latitude);data.startLongitude=cleanNumber(body.longitude);data.startAccuracyMeters=cleanNumber(body.accuracy);data.startedUserAgent=ua;
    }
    if(action==="COMPLETE"){
      if(!current.startedAt)data.startedAt=new Date();
      data.status="COMPLETED";data.completedAt=new Date();
      data.endLatitude=cleanNumber(body.latitude);data.endLongitude=cleanNumber(body.longitude);data.endAccuracyMeters=cleanNumber(body.accuracy);data.completedUserAgent=ua;
    }

    const workOrder=await db.$transaction(async tx=>{
      const updated=await tx.workOrder.update({where:{id},data});
      if(body.photos){
        await tx.workOrderPhoto.deleteMany({where:{workOrderId:id}});
        if(photoRows.length)await tx.workOrderPhoto.createMany({data:photoRows.map(p=>({...p,workOrderId:id}))});
      }
      return updated;
    });
    return NextResponse.json({workOrder});
  }catch(error){return NextResponse.json({error:error instanceof Error?error.message:"No se pudo guardar la ejecución"},{status:400})}
}