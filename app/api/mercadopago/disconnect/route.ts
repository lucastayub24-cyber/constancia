import {NextResponse} from "next/server";
import {requireOrgRole} from "@/lib/org";
import {db} from "@/lib/db";
export async function DELETE(){
 try{
  const{organization}=await requireOrgRole(["OWNER","ADMIN"]);
  await db.organization.update({where:{id:organization.id},data:{
   mpSellerUserId:null,mpSellerPublicKey:null,mpSellerAccessTokenEnc:null,mpSellerRefreshTokenEnc:null,
   mpSellerTokenExpiresAt:null,mpSellerConnectedAt:null,mpSellerScope:null,mpSellerLiveMode:null
  }});
  return NextResponse.json({ok:true});
 }catch(error){return NextResponse.json({error:error instanceof Error?error.message:"No se pudo desconectar Mercado Pago"},{status:400})}
}