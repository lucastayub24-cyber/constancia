import {NextResponse} from "next/server";import {db} from "@/lib/db";import {sendEmail} from "@/lib/email";import {PLAN_INFO} from "@/lib/plans";import {appUrl} from "@/lib/utils";

function authorized(request:Request){
  const secret=process.env.CRON_SECRET;
  if(!secret)return false;
  const auth=request.headers.get("authorization");
  return auth==="Bearer "+secret;
}

export async function GET(request:Request){
  if(!authorized(request))return NextResponse.json({error:"Unauthorized"},{status:401});
  const now=new Date();
  const until=new Date(now.getTime()+7*86400000);
  const certificates=await db.certificate.findMany({
    where:{
      status:"ISSUED",
      nextServiceAt:{gte:now,lte:until},
      reminderSentAt:null,
      organization:{plan:{in:["PRO","BUSINESS"]}},
    },
    include:{organization:true,client:true},
    take:250,
  });
  let sent=0;
  let skipped=0;
  for(const c of certificates){
    const target=c.organization.email;
    if(!target){skipped++;continue}
    const clientName=c.client?.name||"tu cliente";
    const due=c.nextServiceAt!.toLocaleDateString("es-AR");
    await sendEmail(
      target,
      "Próximo service: "+clientName+" · "+due,
      "<p>Tenés un próximo service programado.</p><p><b>Cliente:</b> "+clientName+"<br/><b>Trabajo anterior:</b> "+c.serviceTitle+"<br/><b>Fecha sugerida:</b> "+due+"</p><p><a href=\""+appUrl("/dashboard/constancia/"+c.id)+"\">Abrir constancia</a></p>"
    );
    if(c.client?.email){
      await sendEmail(
        c.client.email,
        "Recordatorio de próximo service · "+c.organization.name,
        "<p>Hola "+c.client.name+",</p><p>"+c.organization.name+" dejó programado un próximo service para el <b>"+due+"</b>.</p><p>Podés coordinar directamente con el prestador.</p>"
      ).catch(()=>null);
    }
    await db.certificate.update({where:{id:c.id},data:{reminderSentAt:new Date()}});
    sent++;
  }
  return NextResponse.json({ok:true,found:certificates.length,sent,skipped});
}
