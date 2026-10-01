import {NextResponse} from "next/server";
import {exchangeSellerCode,readSellerOAuthState,saveSellerConnection} from "@/lib/mp-seller";
import {appUrl} from "@/lib/utils";

export async function GET(request:Request){
  const u=new URL(request.url);
  const code=u.searchParams.get("code");
  const state=u.searchParams.get("state");
  const error=u.searchParams.get("error");
  if(error)return NextResponse.redirect(appUrl("/dashboard/configuracion?mp=denied"));
  if(!code||!state)return NextResponse.redirect(appUrl("/dashboard/configuracion?mp=invalid"));
  try{
    const{organizationId}=readSellerOAuthState(state);
    const token=await exchangeSellerCode(code,state);
    await saveSellerConnection(organizationId,token);
    return NextResponse.redirect(appUrl("/dashboard/configuracion?mp=connected"));
  }catch(error){
    console.error("Mercado Pago OAuth callback",error);
    return NextResponse.redirect(appUrl("/dashboard/configuracion?mp=error"));
  }
}