import {NextResponse} from "next/server";
import {requireOrgRole} from "@/lib/org";
import {sellerAuthorizationUrl,sellerOAuthConfigured} from "@/lib/mp-seller";

export async function GET(){
  try{
    const{organization}=await requireOrgRole(["OWNER","ADMIN"]);
    if(!sellerOAuthConfigured())return NextResponse.redirect(new URL("/dashboard/configuracion?mp=not_configured",process.env.NEXT_PUBLIC_APP_URL||"https://constancia-nu.vercel.app"));
    return NextResponse.redirect(sellerAuthorizationUrl(organization.id));
  }catch{
    return NextResponse.redirect(new URL("/login",process.env.NEXT_PUBLIC_APP_URL||"https://constancia-nu.vercel.app"));
  }
}