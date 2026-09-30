import {NextResponse} from "next/server";
import {z} from "zod";
import {db} from "@/lib/db";
import {consumeRateLimit,RateLimitError} from "@/lib/rate-limit";

const schema=z.object({type:z.enum(["WITHDRAWAL","CANCELLATION","PRIVACY"]),email:z.string().email(),name:z.string().max(160).optional(),organizationName:z.string().max(200).optional(),description:z.string().max(2500).optional()});

export async function POST(request:Request){
  try{
    const input=schema.parse(await request.json());
    const email=input.email.toLowerCase();
    await consumeRateLimit(request,"legal-request",email,10,60*60*1000);
    const user=await db.user.findUnique({where:{email},include:{memberships:{take:1}}});
    const row=await db.legalRequest.create({data:{type:input.type,email,name:input.name||null,organizationName:input.organizationName||null,description:input.description||null,userId:user?.id,organizationId:user?.memberships[0]?.organizationId}});
    return NextResponse.json({ok:true,code:"REQ-"+row.id.slice(-8).toUpperCase()});
  }catch(error){
    if(error instanceof RateLimitError)return NextResponse.json({error:error.message},{status:429});
    return NextResponse.json({error:error instanceof Error?error.message:"No se pudo registrar"},{status:400});
  }
}
