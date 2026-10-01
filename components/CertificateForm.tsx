"use client";
import {useMemo,useState} from "react";
import {useRouter} from "next/navigation";
import {PhotoUploader} from "@/components/PhotoUploader";
import {SignaturePad} from "@/components/SignaturePad";
import {queueCertificate} from "@/lib/offlineQueue";

type Client={id:string;name:string};
type Asset={id:string;clientId:string;name:string;assetNumber:number};
const today=()=>new Date().toISOString().slice(0,10);

export function CertificateForm({clients,assets=[],initialClientId,initialAssetId,initialWorkOrderId,initialTitle,initialDescription,initialAddress,initialNextServiceAt}:{clients:Client[];assets?:Asset[];initialClientId?:string;initialAssetId?:string;initialWorkOrderId?:string;initialTitle?:string;initialDescription?:string;initialAddress?:string;initialNextServiceAt?:string}){
  const r=useRouter();
  const[error,setError]=useState("");
  const[busy,setBusy]=useState(false);
  const[photos,setPhotos]=useState<string[]>([]);
  const[signature,setSignature]=useState("");
  const[queued,setQueued]=useState(false);
  const[selectedClient,setSelectedClient]=useState(initialClientId||"");
  const filteredAssets=useMemo(()=>assets.filter(a=>!selectedClient||a.clientId===selectedClient),[assets,selectedClient]);

  async function saveOffline(body:unknown){
    await queueCertificate(body);
    setQueued(true);
    setError("");
  }

  async function submit(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();setBusy(true);setError("");
    const f=new FormData(e.currentTarget);
    const body={
      clientId:f.get("clientId"),assetId:f.get("assetId")||undefined,workOrderId:initialWorkOrderId||undefined,
      serviceTitle:f.get("serviceTitle"),description:f.get("description"),observations:f.get("observations"),
      technicianName:f.get("technicianName"),serviceAddress:f.get("serviceAddress"),performedAt:f.get("performedAt"),
      nextServiceAt:f.get("nextServiceAt"),warrantyUntil:f.get("warrantyUntil"),
      signatureName:f.get("signatureName"),signatureDocument:f.get("signatureDocument"),signatureDataUrl:signature,photoKeys:photos,
      totalAmount:f.get("totalAmount")||undefined,paymentDueDate:f.get("paymentDueDate"),
      initialPaymentAmount:f.get("initialPaymentAmount")||undefined,initialPaymentMethod:f.get("initialPaymentMethod")||undefined,
      paymentReference:f.get("paymentReference"),paymentNotes:f.get("paymentNotes")
    };
    if(!navigator.onLine){try{await saveOffline(body)}catch{setError("No pudimos guardar la constancia en el dispositivo.")}finally{setBusy(false)}return}
    try{
      const res=await fetch("/api/certificates",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
      const j=await res.json().catch(()=>({}));if(!res.ok)throw new Error(j.error||"No se pudo emitir la constancia");
      r.push("/dashboard/constancia/"+j.id);r.refresh();
    }catch(err){
      if(!navigator.onLine||err instanceof TypeError){try{await saveOffline(body)}catch{setError("Se perdió la conexión y no pudimos guardar la constancia localmente.")}}
      else setError(err instanceof Error?err.message:"No se pudo emitir");
    }finally{setBusy(false)}
  }

  if(clients.length===0)return <div className="panel"><h2>Primero creá un cliente</h2><p className="muted">Necesitamos asociar la constancia a una persona o empresa.</p><a className="btn btn-brand" href="/dashboard/clientes">Crear cliente</a></div>;

  return <form className="form" onSubmit={submit}>
    {queued&&<div className="success"><b>Constancia guardada sin conexión.</b><br/>Se enviará automáticamente cuando vuelva internet. No cierres sesión antes de que se sincronice.</div>}
    {initialWorkOrderId&&<div className="success"><b>Orden de trabajo finalizada.</b> Esta constancia documentará el cierre ya validado con checklist, GPS y evidencia de campo.</div>}
    <section className="panel"><h2>Cliente, activo y trabajo</h2><div className="form-grid">
      <label className="field">Cliente<select className="select" name="clientId" required defaultValue={initialClientId||""} onChange={e=>setSelectedClient(e.target.value)}><option value="" disabled>Seleccionar</option>{clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
      <label className="field">Equipo / activo<select className="select" name="assetId" defaultValue={initialAssetId||""}><option value="">Sin activo específico</option>{filteredAssets.map(a=><option key={a.id} value={a.id}>A-{String(a.assetNumber).padStart(5,"0")} · {a.name}</option>)}</select></label>
      <label className="field">Fecha<input className="input" name="performedAt" type="date" defaultValue={today()} required/></label>
      <label className="field">Técnico<input className="input" name="technicianName"/></label>
      <label className="field full">Título<input className="input" name="serviceTitle" required placeholder="Ej. Mantenimiento preventivo" defaultValue={initialTitle||""}/></label>
      <label className="field full">Descripción<textarea className="textarea" name="description" required placeholder="Tareas realizadas, verificaciones y resultado final." defaultValue={initialDescription||""}/></label>
      <label className="field full">Observaciones<textarea className="textarea" name="observations"/></label>
      <label className="field full">Dirección del servicio<input className="input" name="serviceAddress" defaultValue={initialAddress||""}/></label>
    </div></section>
    <section className="panel"><h2>Evidencia</h2><PhotoUploader onChange={setPhotos}/></section>
    <section className="panel"><h2>Cobro del trabajo</h2><div className="form-grid">
      <label className="field">Importe total (ARS)<input className="input" name="totalAmount" type="number" min="0" step=".01" placeholder="150000"/></label>
      <label className="field">Vencimiento del saldo<input className="input" name="paymentDueDate" type="date"/></label>
      <label className="field">Abonado ahora (ARS)<input className="input" name="initialPaymentAmount" type="number" min="0" step=".01" placeholder="0"/></label>
      <label className="field">Medio de pago<select className="select" name="initialPaymentMethod" defaultValue=""><option value="">Sin pago inicial</option><option value="CASH">Efectivo</option><option value="BANK_TRANSFER">Transferencia</option><option value="MERCADO_PAGO">Mercado Pago</option><option value="DEBIT_CARD">Débito</option><option value="CREDIT_CARD">Crédito</option><option value="CHECK">Cheque</option><option value="OTHER">Otro</option></select></label>
      <label className="field">Referencia / operación<input className="input" name="paymentReference"/></label>
      <label className="field">Nota del cobro<input className="input" name="paymentNotes" placeholder="Ej. saldo contra entrega"/></label>
    </div></section>
    <section className="panel"><h2>Postventa y conformidad</h2><div className="form-grid">
      <label className="field">Próximo service<input className="input" name="nextServiceAt" type="date" defaultValue={initialNextServiceAt||""}/></label>
      <label className="field">Garantía del trabajo hasta<input className="input" name="warrantyUntil" type="date"/></label>
      <label className="field">Recibido por<input className="input" name="signatureName" placeholder="Nombre y apellido"/></label>
      <label className="field">DNI / documento<input className="input" name="signatureDocument" placeholder="Documento de quien firma"/></label>
      <div className="full"><SignaturePad onChange={setSignature}/><small className="muted" style={{display:"block",marginTop:7}}>Al firmar se registra fecha, IP y dispositivo como evidencia técnica de conformidad.</small></div>
    </div></section>
    {error&&<div className="error">{error}</div>}
    <div className="actions">{queued&&<button className="btn btn-light" type="button" onClick={()=>location.reload()}>Crear otra</button>}<button className="btn btn-brand" disabled={busy||queued}>{busy?"Guardando...":queued?"Guardada offline":"Emitir constancia"}</button></div>
  </form>
}