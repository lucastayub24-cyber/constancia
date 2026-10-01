import {db} from "@/lib/db";
import {activeOrganization} from "@/lib/org";
import {CertificateForm} from "@/components/CertificateForm";

export default async function NewCertificate({searchParams}:{searchParams:Promise<{client?:string;asset?:string;workOrder?:string}>}){
  const {organization}=await activeOrganization();
  const query=await searchParams;
  const [clients,assets,workOrder]=await Promise.all([
    db.client.findMany({where:{organizationId:organization.id},select:{id:true,name:true},orderBy:{name:"asc"}}),
    db.asset.findMany({where:{organizationId:organization.id,status:"ACTIVE"},select:{id:true,clientId:true,name:true,assetNumber:true},orderBy:{name:"asc"}}),
    query.workOrder?db.workOrder.findFirst({where:{id:query.workOrder,organizationId:organization.id},select:{id:true,clientId:true,assetId:true,title:true,description:true,serviceAddress:true,template:{select:{defaultNextServiceDays:true}}}}):null
  ]);
  const candidateClient=workOrder?.clientId||query.client;
  const candidateAsset=workOrder?.assetId||query.asset;
  const initialClientId=candidateClient&&clients.some(c=>c.id===candidateClient)?candidateClient:undefined;
  const initialAssetId=candidateAsset&&assets.some(a=>a.id===candidateAsset)?candidateAsset:undefined;
  const nextDate=workOrder?.template?.defaultNextServiceDays?new Date(Date.now()+workOrder.template.defaultNextServiceDays*86400000).toISOString().slice(0,10):undefined;
  return <><header className="page-head"><div><div className="eyebrow">NUEVA CONSTANCIA</div><h1>Documentá el trabajo.</h1><p>Servicio, equipo, evidencia, cobro, firma, garantía y próximo mantenimiento.</p></div></header><CertificateForm clients={clients} assets={assets} initialClientId={initialClientId} initialAssetId={initialAssetId} initialWorkOrderId={workOrder?.id} initialTitle={workOrder?.title} initialDescription={workOrder?.description} initialAddress={workOrder?.serviceAddress||undefined} initialNextServiceAt={nextDate}/></>
}