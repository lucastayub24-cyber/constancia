import {NextResponse} from "next/server";
import {compare} from "bcryptjs";
import {db} from "@/lib/db";
import {createSession} from "@/lib/auth";
import {loginSchema} from "@/lib/validation";
import {consumeRateLimit,RateLimitError} from "@/lib/rate-limit";

export async function POST(request:Request){
  try{
    const input=loginSchema.parse(await request.json());
    const email=input.email.toLowerCase();
    await consumeRateLimit(request,"login",email,10,15*60*1000);
    const user=await db.user.findUnique({where:{email}});
    if(!user||!(await compare(input.password,user.passwordHash)))return NextResponse.json({error:"Email o contraseña incorrectos."},{status:401});
    await createSession(user.id);
    return NextResponse.json({ok:true});
  }catch(error){
    if(error instanceof RateLimitError)return NextResponse.json({error:error.message},{status:429});
    return NextResponse.json({error:error instanceof Error?error.message:"No se pudo ingresar"},{status:400});
  }
}
