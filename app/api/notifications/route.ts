import {NextResponse} from "next/server";
import {activeOrganization} from "@/lib/org";
import {db} from "@/lib/db";
export async function GET(){
 try{
  const{organization}=await activeOrganization();const now=new Date();const soon=new Date(Date.now()+14*86400000);
  const[stored,due,overdue,orders]=await Promise.all([
   db.notification.findMany({where:{organizationId:organization.id,readAt:null},orderBy:{createdAt:"desc"},take:20}),
   db.certificate.count({where:{organizationId:organization.id,status:"ISSUED",nextServiceAt:{gte:now,lte:soon}}}),
   db.certificate.count({where:{organizationId:organization.id,status:"ISSUED",paymentDueDate:{lt:now},paymentStatus:{in:["PENDING","PARTIAL"]}}}),
   db.workOrder.count({where:{organizationId:organization.id,status:{notIn:["COMPLETED","CANCELED"]},scheduledStart:{gte:now,lte:new Date(Date.now()+3*86400000)}}})
  ]);
  return NextResponse.json({count:stored.length+due+overdue+orders,summary:{stored:stored.length,due,overdue,orders}});
 }catch{return NextResponse.json({count:0},{status:401})}
}