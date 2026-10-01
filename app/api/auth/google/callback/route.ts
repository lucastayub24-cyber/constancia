import {NextResponse} from "next/server";
import {hash} from "bcryptjs";
import {randomBytes,randomUUID} from "crypto";
import {cookies} from "next/headers";
import {db} from "@/lib/db";
import {createSession} from "@/lib/auth";
import {createDemoWorkspace} from "@/lib/demo-data";
import {consumeRateLimit} from "@/lib/rate-limit";
import {exchangeGoogleCode,googleUserInfo,safeNext,sameState} from "@/lib/google-auth";
import {appUrl,slugify} from "@/lib/utils";

function fail(reason:string,from:string,next:string){
  return NextResponse.redirect(appUrl("/"+(from==="register"?"registro":"login")+"?google="+encodeURIComponent(reason)+"&next="+encodeURIComponent(next)));
}

export async function GET(request:Request){
  const u=new URL(request.url);
  const jar=await cookies();
  const storedState=jar.get("google_oauth_state")?.value;
  const next=safeNext(jar.get("google_oauth_next")?.value);
  const from=jar.get("google_oauth_from")?.value==="register"?"register":"login";
  const state=u.searchParams.get("state");
  const code=u.searchParams.get("code");
  const denied=u.searchParams.get("error");
  if(denied)return fail("denied",from,next);
  if(!code||!sameState(state,storedState))return fail("invalid_state",from,next);

  try{
    const token=await exchangeGoogleCode(code);
    const profile=await googleUserInfo(token.access_token);
    const email=profile.email.trim().toLowerCase();
    await consumeRateLimit(request,"google-login",email,20,15*60*1000);

    let user=await db.user.findFirst({where:{OR:[{googleSub:profile.sub},{email}]}});

    if(user){
      if(user.googleSub&&user.googleSub!==profile.sub)return fail("account_conflict",from,next);
      if(!user.googleSub){
        const googleAuthoritative=email.endsWith("@gmail.com")||Boolean(profile.hd);
        if(!googleAuthoritative)return fail("link_required",from,next);
      }
      user=await db.user.update({where:{id:user.id},data:{
        googleSub:profile.sub,
        avatarUrl:profile.picture||user.avatarUrl,
        name:user.name||profile.name||email.split("@")[0],
      }});
    }else{
      const passwordHash=await hash(randomBytes(32).toString("hex"),12);
      const userCount=await db.user.count();
      const personName=(profile.name||profile.given_name||email.split("@")[0]).trim();
      const organizationName=(profile.given_name||personName.split(" ")[0]||"Mi actividad")+" · Servicios";
      const slug=slugify(organizationName)+"-"+randomUUID().slice(0,6);
      user=await db.$transaction(async tx=>{
        const created=await tx.user.create({data:{
          email,passwordHash,name:personName,googleSub:profile.sub,avatarUrl:profile.picture||null,
          role:userCount===0?"ADMIN":"USER",
        }});
        const org=await tx.organization.create({data:{name:organizationName,email,publicSlug:slug}});
        await tx.membership.create({data:{organizationId:org.id,userId:created.id,role:"OWNER"}});
        await tx.user.update({where:{id:created.id},data:{activeOrganizationId:org.id}});
        await createDemoWorkspace(tx,{organizationId:org.id,userId:created.id});
        return created;
      });
    }

    await createSession(user.id);
    const response=NextResponse.redirect(appUrl(next));
    response.cookies.set("google_oauth_state","",{httpOnly:true,path:"/",expires:new Date(0)});
    response.cookies.set("google_oauth_next","",{httpOnly:true,path:"/",expires:new Date(0)});
    response.cookies.set("google_oauth_from","",{httpOnly:true,path:"/",expires:new Date(0)});
    return response;
  }catch(error){
    console.error("Google auth callback",error);
    return fail("error",from,next);
  }
}