import {activeOrganization} from "@/lib/org";
import {SettingsForm} from "@/components/SettingsForm";
import {AccountTools} from "@/components/AccountTools";

export default async function Settings(){
  const{organization}=await activeOrganization();
  return <><header className="page-head"><div><div className="eyebrow">CONFIGURACIÓN</div><h1>Datos de tu empresa</h1><p>Identidad del emisor, privacidad y control de cuenta.</p></div></header>
    <SettingsForm initial={{name:organization.name,legalName:organization.legalName||"",cuit:organization.cuit||"",email:organization.email||"",phone:organization.phone||"",address:organization.address||""}}/>
    <AccountTools/>
  </>
}
