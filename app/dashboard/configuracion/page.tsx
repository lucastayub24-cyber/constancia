import {activeOrganization} from "@/lib/org";
import {SettingsForm} from "@/components/SettingsForm";
import {AccountTools} from "@/components/AccountTools";
import {MercadoPagoConnection} from "@/components/MercadoPagoConnection";
import {sellerOAuthConfigured} from "@/lib/mp-seller";

export default async function Settings(){
  const{organization}=await activeOrganization();
  return <><header className="page-head"><div><div className="eyebrow">CONFIGURACIÓN</div><h1>Datos de tu empresa</h1><p>Identidad del emisor, cobros, privacidad y control de cuenta.</p></div></header>
    <SettingsForm initial={{name:organization.name,legalName:organization.legalName||"",cuit:organization.cuit||"",email:organization.email||"",phone:organization.phone||"",address:organization.address||""}}/>
    <MercadoPagoConnection configured={sellerOAuthConfigured()} connected={Boolean(organization.mpSellerConnectedAt&&organization.mpSellerAccessTokenEnc)} userId={organization.mpSellerUserId||null} expiresAt={organization.mpSellerTokenExpiresAt?.toISOString()||null}/>
    <AccountTools/>
  </>
}
