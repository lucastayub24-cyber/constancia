import {activeOrganization} from "@/lib/org";
import {db} from "@/lib/db";
import {appUrl} from "@/lib/utils";

const esc=(v:string)=>v.replace(/\\/g,"\\\\").replace(/\n/g,"\\n").replace(/,/g,"\\,").replace(/;/g,"\\;");
const utc=(d:Date)=>d.toISOString().replace(/[-:]/g,"").replace(/\.\d{3}Z$/,"Z");

export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){
 const{id}=await params;const{organization}=await activeOrganization();
 const w=await db.workOrder.findFirst({where:{id,organizationId:organization.id},include:{client:true,asset:true,assignedUser:true}});
 if(!w||!w.scheduledStart)return new Response("Trabajo sin fecha",{status:404});
 const end=w.scheduledEnd||new Date(w.scheduledStart.getTime()+60*60*1000);
 const title="OT-"+String(w.sequentialNumber).padStart(5,"0")+" · "+w.title;
 const description=[w.description,"Cliente: "+w.client.name,w.asset?"Equipo: "+w.asset.name:"",w.assignedUser?"Técnico: "+w.assignedUser.name:"","Abrir en Constancia: "+appUrl("/dashboard/orden/"+w.id)].filter(Boolean).join("\n");
 const ics=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Constancia//Agenda//ES","CALSCALE:GREGORIAN","METHOD:PUBLISH","BEGIN:VEVENT","UID:"+w.id+"@constancia","DTSTAMP:"+utc(new Date()),"DTSTART:"+utc(w.scheduledStart),"DTEND:"+utc(end),"SUMMARY:"+esc(title),"DESCRIPTION:"+esc(description),"LOCATION:"+esc(w.serviceAddress||w.client.address||""),"URL:"+appUrl("/dashboard/orden/"+w.id),"END:VEVENT","END:VCALENDAR"].join("\r\n");
 return new Response(ics,{headers:{"Content-Type":"text/calendar; charset=utf-8","Content-Disposition":'inline; filename="OT-'+String(w.sequentialNumber).padStart(5,"0")+'.ics"',"Cache-Control":"private, no-store"}});
}