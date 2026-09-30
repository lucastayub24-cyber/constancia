import {NextResponse} from "next/server";
import {createHash,randomBytes} from "crypto";
import {z} from "zod";
import {db} from "@/lib/db";
import {sendEmail} from "@/lib/email";
import {appUrl} from "@/lib/utils";
import {consumeRateLimit,RateLimitError} from "@/lib/rate-limit";

const schema=z.object({email:z.string().email()});

export async function POST(request:Request){
  try{
    const{email}=schema.parse(await request.json());
    const normalized=email.toLowerCase();
    await consumeRateLimit(request,"forgot",normalized,5,60*60*1000);
    const user=await db.user.findUnique({where:{email:normalized}});
    if(user){
      await db.passwordResetToken.deleteMany({where:{userId:user.id,usedAt:null}});
      const token=randomBytes(32).toString("hex");
      const tokenHash=createHash("sha256").update(token).digest("hex");
      await db.passwordResetToken.create({data:{userId:user.id,tokenHash,expiresAt:new Date(Date.now()+3600000)}});
      const link=appUrl("/restablecer/"+token);
      await sendEmail(user.email,"Restablecer contraseña de Constancia","<p>Recibimos una solicitud para cambiar tu contraseña.</p><p><a href=\""+link+"\">Crear nueva contraseña</a></p><p>El enlace vence en 60 minutos.</p>");
    }
    return NextResponse.json({ok:true});
  }catch(error){
    if(error instanceof RateLimitError)return NextResponse.json({error:error.message},{status:429});
    return NextResponse.json({ok:true});
  }
}
