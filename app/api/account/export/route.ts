import {db} from "@/lib/db";
import {requireUser} from "@/lib/auth";

export async function GET(){
  try{
    const user=await requireUser();
    const memberships=await db.membership.findMany({
      where:{userId:user.id},
      include:{
        organization:{
          include:{
            clients:true,
            certificates:{include:{photos:true,servicePayments:true}},
            subscriptionPayments:true,
            teamInvites:true,
            legalRequests:true
          }
        }
      }
    });
    const legalRequests=await db.legalRequest.findMany({where:{userId:user.id}});
    const payload={
      exportedAt:new Date(),
      account:{id:user.id,email:user.email,name:user.name,role:user.role,createdAt:user.createdAt,updatedAt:user.updatedAt},
      organizations:memberships.map(m=>({membershipRole:m.role,organization:m.organization})),
      legalRequests
    };
    const json=JSON.stringify(payload,(_,value)=>typeof value==="bigint"?value.toString():value,2);
    return new Response(json,{headers:{"Content-Type":"application/json; charset=utf-8","Content-Disposition":'attachment; filename="constancia-datos-'+new Date().toISOString().slice(0,10)+'.json"',"Cache-Control":"private, no-store"}});
  }catch{
    return new Response("No autorizado",{status:401});
  }
}
