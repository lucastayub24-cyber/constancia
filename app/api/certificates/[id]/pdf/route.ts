import {db} from "@/lib/db";
import {certificatePdfBuffer} from "@/lib/certificate-pdf";

export async function GET(_:Request,{params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  const certificate=await db.certificate.findUnique({
    where:{code:id},
    include:{
      organization:true,
      client:true,
      photos:true,
      servicePayments:{orderBy:{paidAt:"asc"}}
    }
  });
  if(!certificate||certificate.status==="VOID"){
    return new Response("Constancia no encontrada",{status:404});
  }
  try{
    const buffer=await certificatePdfBuffer(certificate);
    return new Response(new Uint8Array(buffer),{
      headers:{
        "Content-Type":"application/pdf",
        "Content-Disposition":'inline; filename="constancia-'+String(certificate.sequentialNumber).padStart(6,"0")+'.pdf"',
        "Cache-Control":"private, no-store"
      }
    });
  }catch(error){
    console.error(error);
    return new Response("No se pudo generar el PDF",{status:500});
  }
}
