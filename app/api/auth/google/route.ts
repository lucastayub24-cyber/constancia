import {NextResponse} from "next/server";
import {googleAuthorizationUrl,googleAuthConfigured,newGoogleState,safeNext} from "@/lib/google-auth";
import {appUrl} from "@/lib/utils";

export async function GET(request:Request){
  const u=new URL(request.url);
  const next=safeNext(u.searchParams.get("next"));
  const from=u.searchParams.get("from")==="register"?"register":"login";
  if(!googleAuthConfigured())return NextResponse.redirect(appUrl("/"+(from==="register"?"registro":"login")+"?google=not_configured&next="+encodeURIComponent(next)));
  const state=newGoogleState();
  const response=NextResponse.redirect(googleAuthorizationUrl(state));
  const secure=process.env.NODE_ENV==="production";
  response.cookies.set("google_oauth_state",state,{httpOnly:true,sameSite:"lax",secure,path:"/",maxAge:600});
  response.cookies.set("google_oauth_next",next,{httpOnly:true,sameSite:"lax",secure,path:"/",maxAge:600});
  response.cookies.set("google_oauth_from",from,{httpOnly:true,sameSite:"lax",secure,path:"/",maxAge:600});
  return response;
}