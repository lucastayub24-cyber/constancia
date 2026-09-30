import {db} from "@/lib/db";
import {activeOrganization} from "@/lib/org";
import {CertificateForm} from "@/components/CertificateForm";

export default async function NewCertificate({searchParams}:{searchParams:Promise<{client?:string}>}){
  const {organization}=await activeOrganization();
  const query=await searchParams;
  const clients=await db.client.findMany({
    where:{organizationId:organization.id},
    select:{id:true,name:true},
    orderBy:{name:"asc"},
  });
  const initialClientId=query.client&&clients.some(c=>c.id===query.client)?query.client:undefined;
  return <>
    <header className="page-head">
      <div>
        <div className="eyebrow">NUEVA CONSTANCIA</div>
        <h1>Documentá el trabajo.</h1>
        <p>Servicio, evidencia, cobro, firma y próximo mantenimiento.</p>
      </div>
    </header>
    <CertificateForm clients={clients} initialClientId={initialClientId}/>
  </>;
}
