import {NextResponse} from "next/server";
import {activeOrganization} from "@/lib/org";
import {db} from "@/lib/db";

export async function GET(request:Request){
  try{
    const{organization}=await activeOrganization();
    const q=new URL(request.url).searchParams.get("q")?.trim()||"";
    if(q.length<2)return NextResponse.json({results:[]});
    const num=Number(q.replace(/\D/g,""));
    const [clients,assets,orders,certs,quotes]=await Promise.all([
      db.client.findMany({where:{organizationId:organization.id,OR:[{name:{contains:q,mode:"insensitive"}},{email:{contains:q,mode:"insensitive"}},{phone:{contains:q,mode:"insensitive"}},{taxId:{contains:q,mode:"insensitive"}}]},take:5}),
      db.asset.findMany({where:{organizationId:organization.id,OR:[{name:{contains:q,mode:"insensitive"}},{brand:{contains:q,mode:"insensitive"}},{model:{contains:q,mode:"insensitive"}},{serialNumber:{contains:q,mode:"insensitive"}},...(Number.isFinite(num)&&num>0?[{assetNumber:num}]:[])]},include:{client:true},take:5}),
      db.workOrder.findMany({where:{organizationId:organization.id,OR:[{title:{contains:q,mode:"insensitive"}},...(Number.isFinite(num)&&num>0?[{sequentialNumber:num}]:[])]},include:{client:true,asset:true},take:5}),
      db.certificate.findMany({where:{organizationId:organization.id,status:{not:"VOID"},OR:[{serviceTitle:{contains:q,mode:"insensitive"}},{code:{contains:q,mode:"insensitive"}},...(Number.isFinite(num)&&num>0?[{sequentialNumber:num}]:[])]},include:{client:true,asset:true},take:5}),
      db.quote.findMany({where:{organizationId:organization.id,OR:[{title:{contains:q,mode:"insensitive"}},...(Number.isFinite(num)&&num>0?[{sequentialNumber:num}]:[])]},include:{client:true},take:5})
    ]);
    const results=[
      ...clients.map(x=>({type:"Cliente",title:x.name,subtitle:x.email||x.phone||x.taxId||"Cliente",href:"/dashboard/cliente/"+x.id})),
      ...assets.map(x=>({type:"Activo",title:"A-"+String(x.assetNumber).padStart(5,"0")+" · "+x.name,subtitle:x.client.name+(x.serialNumber?" · "+x.serialNumber:""),href:"/dashboard/activo/"+x.id})),
      ...orders.map(x=>({type:"Orden",title:"OT-"+String(x.sequentialNumber).padStart(5,"0")+" · "+x.title,subtitle:x.client.name+(x.asset?" · "+x.asset.name:""),href:"/dashboard/orden/"+x.id})),
      ...certs.map(x=>({type:"Constancia",title:"#"+String(x.sequentialNumber).padStart(6,"0")+" · "+x.serviceTitle,subtitle:(x.client?.name||"Sin cliente")+(x.asset?" · "+x.asset.name:""),href:"/dashboard/constancia/"+x.id})),
      ...quotes.map(x=>({type:"Presupuesto",title:"P-"+String(x.sequentialNumber).padStart(5,"0")+" · "+x.title,subtitle:x.client.name,href:"/dashboard/presupuestos"}))
    ].slice(0,18);
    return NextResponse.json({results});
  }catch{return NextResponse.json({results:[]},{status:401})}
}