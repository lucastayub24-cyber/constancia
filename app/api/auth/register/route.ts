import {NextResponse} from "next/server";
import {hash} from "bcryptjs";
import {db} from "@/lib/db";
import {createSession} from "@/lib/auth";
import {registerSchema} from "@/lib/validation";
import {slugify} from "@/lib/utils";
import {randomUUID} from "crypto";
import {consumeRateLimit,RateLimitError} from "@/lib/rate-limit";

export async function POST(request:Request){
  try{
    await consumeRateLimit(request,"register","new-account",10,60*60*1000);
    const input=registerSchema.parse(await request.json());
    const email=input.email.toLowerCase();
    if(await db.user.findUnique({where:{email}}))return NextResponse.json({error:"Ese email ya está registrado."},{status:409});
    const passwordHash=await hash(input.password,12);
    const userCount=await db.user.count();
    const slug=slugify(input.organizationName)+"-"+randomUUID().slice(0,6);
    const user=await db.$transaction(async tx=>{
      const created=await tx.user.create({data:{email,name:input.name,passwordHash,role:userCount===0?"ADMIN":"USER"}});
      const org=await tx.organization.create({data:{name:input.organizationName,email,publicSlug:slug}});
      await tx.membership.create({data:{organizationId:org.id,userId:created.id,role:"OWNER"}});
      await tx.user.update({where:{id:created.id},data:{activeOrganizationId:org.id}});
      return created;
    });
    await createSession(user.id);
    return NextResponse.json({ok:true});
  }catch(error){
    if(error instanceof RateLimitError)return NextResponse.json({error:error.message},{status:429});
    return NextResponse.json({error:error instanceof Error?error.message:"No se pudo crear la cuenta"},{status:400});
  }
}
