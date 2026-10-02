"use client";
import {useMemo,useRef,useState} from "react";
import {useRouter} from "next/navigation";
import {ArrowLeft,ArrowRight,Camera,Check,CircleDollarSign,FileCheck2,PenLine} from "lucide-react";
import {PhotoUploader} from "@/components/PhotoUploader";
import {SignaturePad} from "@/components/SignaturePad";
import {queueCertificate} from "@/lib/offlineQueue";

type Client={id:string;name:string};type Asset={id:string;clientId:string;name:string;assetNumber:number};
const today=()=>new Date().toISOString().slice(0,10);
const steps=[["Trabajo",FileCheck2],["Fotos",Camera],["Cobro",CircleDollarSign],["Cierre",PenLine]] as const;

export function CertificateForm({clients,assets=[],initialClientId,initialAssetId,initialWorkOrderId,initialTitle,initialDescription,initialAddress,initialNextServiceAt}:{clients:Client[];assets?:Asset[];initialClientId?:string;initialAssetId?:string;initialWorkOrderId?:string;initialTitle?:string;initialDescription?:string;initialAddress?:string;initialNextServiceAt?:string}){
 const r=useRouter();const formRef=useRef<HTMLFormElement|null>(null);const[error,setError]=useState("");const[busy,setBusy]=useState(false);const[photos,setPhotos]=useState<string[]>([]);const[signature,setSignature]=useState("");const[queued,setQueued]=useState(false);const[selectedClient,setSelectedClient]=useState(initialClientId||"");const[step,setStep]=useState(0);
 const filteredAssets=useMemo(()=>assets.filter(a=>!selectedClient||a.clientId===selectedClient),[assets,selectedClient]);
 function nextStep(){
  const current=formRef.current?.querySelector(".wizard-panel.show");
  const required=current?Array.from(current.querySelectorAll<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>("[required]")):[];
  const invalid=required.find(el=>!el.checkValidity());
  if(invalid){invalid.reportValidity();invalid.focus();return}
  setStep(v=>Math.min(3,v+1));
 }
 async function saveOffline(body:unknown){await queueCertificate(body);setQueued(true);setError("")}
 async function submit(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();setBusy(true);setError("");const f=new FormData(e.currentTarget);const body={clientId:f.get("clientId"),assetId:f.get("assetId")||undefined,workOrderId:initialWorkOrderId||undefined,serviceTitle:f.get("serviceTitle"),description:f.get("description"),observations:f.get("observations"),technicianName:f.get("technicianName"),serviceAddress:f.get("serviceAddress"),performedAt:f.get("performedAt"),nextServiceAt:f.get("nextServiceAt"),warrantyUntil:f.get("warrantyUntil"),signatureName:f.get("signatureName"),signatureDocument:f.get("signatureDocument"),signatureDataUrl:signature,photoKeys:photos,totalAmount:f.get("totalAmount")||undefined,paymentDueDate:f.get("paymentDueDate"),initialPaymentAmount:f.get("initialPaymentAmount")||undefined,initialPaymentMethod:f.get("initialPaymentMethod")||undefined,paymentReference:f.get("paymentReference"),paymentNotes:f.get("paymentNotes")};
  if(!navigator.onLine){try{await saveOffline(body)}catch{setError("No pudimos guardar la constancia en el dispositivo.")}finally{setBusy(false)}return}
  try{const res=await fetch("/api/certificates",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});const j=await res.json().catch(()=>({}));if(!res.ok)throw new Error(j.error||"No se pudo emitir la constancia");r.push("/dashboard/constancia/"+j.id);r.refresh()}catch(err){if(!navigator.onLine||err instanceof TypeError){try{await saveOffline(body)}catch{setError("Se perdió la conexión y no pudimos guardarla localmente.")}}else setError(err instanceof Error?err.message:"No se pudo emitir")}finally{setBusy(false)}
 }
 if(clients.length===0)return <div className="prerequisite-card"><div className="empty-icon"><FileCheck2 size={23}/></div><div><span className="eyebrow">PRIMERO UN CLIENTE</span><h2>Necesitamos saber para quién fue el trabajo.</h2><p>Creá el cliente y después volvés a emitir la constancia.</p></div><a className="btn btn-brand" href="/dashboard/clientes#nuevo">Crear cliente</a></div>;
 return <form ref={formRef} className="form certificate-wizard" onSubmit={submit}>
  {queued&&<div className="success"><b>Guardada sin conexión.</b> Se enviará sola cuando vuelva internet.</div>}
  {initialWorkOrderId&&<div className="wizard-context"><Check size={15}/><div><b>Trabajo terminado.</b><span>Ahora solo falta dejarlo documentado.</span></div></div>}
  <div className="wizard-steps">{steps.map(([label,Icon],i)=><button type="button" key={label} className={(i===step?"active ":"")+(i<step?"done":"")} onClick={()=>{if(i<=step)setStep(i)}}><i>{i<step?<Check size={12}/>:<Icon size={14}/>}</i><span><small>PASO {i+1}</small><b>{label}</b></span></button>)}</div>

  <section className={"panel wizard-panel "+(step===0?"show":"")} aria-hidden={step!==0}><div className="wizard-panel-head"><span>PASO 1 DE 4</span><h2>¿Qué trabajo hiciste?</h2><p>Estos son los únicos datos necesarios para emitir.</p></div><div className="form-grid">
   <label className="field">Cliente<select className="select" name="clientId" required defaultValue={initialClientId||""} onChange={e=>setSelectedClient(e.target.value)}><option value="" disabled>Elegí un cliente</option>{clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
   <label className="field">Equipo <small>opcional</small><select className="select" name="assetId" defaultValue={initialAssetId||""}><option value="">Sin equipo específico</option>{filteredAssets.map(a=><option key={a.id} value={a.id}>A-{String(a.assetNumber).padStart(5,"0")} · {a.name}</option>)}</select></label>
   <label className="field full">¿Qué hiciste?<input className="input input-big" name="serviceTitle" required placeholder="Ej. Service preventivo del aire" defaultValue={initialTitle||""}/></label>
   <label className="field full">Contalo en pocas palabras<textarea className="textarea" name="description" required placeholder="Ej. Se limpió, se controló presión y quedó funcionando correctamente." defaultValue={initialDescription||""}/></label>
   <label className="field">Fecha<input className="input" name="performedAt" type="date" defaultValue={today()} required/></label>
   <label className="field">Técnico <small>opcional</small><input className="input" name="technicianName" placeholder="Nombre de quien hizo el trabajo"/></label>
   <label className="field full">Dirección <small>opcional</small><input className="input" name="serviceAddress" defaultValue={initialAddress||""}/></label>
   <label className="field full">Observación <small>opcional</small><textarea className="textarea" name="observations" placeholder="Algo que quieras dejar aclarado."/></label>
  </div></section>

  <section className={"panel wizard-panel "+(step===1?"show":"")} aria-hidden={step!==1}><div className="wizard-panel-head"><span>PASO 2 DE 4 · OPCIONAL</span><h2>¿Querés agregar fotos?</h2><p>Sirven como evidencia del estado y del trabajo. Si no tenés, seguí sin cargar nada.</p></div><PhotoUploader onChange={setPhotos}/><div className="wizard-skip-note">{photos.length===0?"No cargaste fotos. Podés continuar igual.":photos.length+" foto"+(photos.length===1?"":"s")+" lista"+(photos.length===1?"":"s")+"."}</div></section>

  <section className={"panel wizard-panel "+(step===2?"show":"")} aria-hidden={step!==2}><div className="wizard-panel-head"><span>PASO 3 DE 4 · OPCIONAL</span><h2>¿Cuánto hay que cobrar?</h2><p>Si no querés manejar cobros en esta constancia, dejá todo vacío y seguí.</p></div><div className="form-grid">
   <label className="field field-big">Total del trabajo<input className="input" name="totalAmount" type="number" min="0" step=".01" placeholder="Ej. 150000"/></label>
   <label className="field">¿Pagó algo ahora?<input className="input" name="initialPaymentAmount" type="number" min="0" step=".01" placeholder="0"/></label>
   <label className="field">Cómo pagó<select className="select" name="initialPaymentMethod" defaultValue=""><option value="">No registrar pago ahora</option><option value="CASH">Efectivo</option><option value="BANK_TRANSFER">Transferencia</option><option value="MERCADO_PAGO">Mercado Pago</option><option value="DEBIT_CARD">Débito</option><option value="CREDIT_CARD">Crédito</option><option value="CHECK">Cheque</option><option value="OTHER">Otro</option></select></label>
   <label className="field">Vence el <small>opcional</small><input className="input" name="paymentDueDate" type="date"/></label>
   <label className="field">N.º operación <small>opcional</small><input className="input" name="paymentReference"/></label>
   <label className="field full">Nota del cobro <small>opcional</small><input className="input" name="paymentNotes" placeholder="Ej. saldo contra entrega"/></label>
  </div></section>

  <section className={"panel wizard-panel "+(step===3?"show":"")} aria-hidden={step!==3}><div className="wizard-panel-head"><span>PASO 4 DE 4</span><h2>Listo. ¿Querés firma o recordatorio?</h2><p>Todo esto es opcional. La firma suma conformidad y el próximo service ayuda a volver a vender.</p></div><div className="form-grid">
   <label className="field">Próximo service <small>opcional</small><input className="input" name="nextServiceAt" type="date" defaultValue={initialNextServiceAt||""}/></label>
   <label className="field">Garantía hasta <small>opcional</small><input className="input" name="warrantyUntil" type="date"/></label>
   <label className="field">Recibido por <small>opcional</small><input className="input" name="signatureName" placeholder="Nombre y apellido"/></label>
   <label className="field">DNI / documento <small>opcional</small><input className="input" name="signatureDocument"/></label>
   <div className="full"><SignaturePad onChange={setSignature}/><small className="muted" style={{display:"block",marginTop:7}}>La firma queda asociada a fecha, IP y dispositivo como evidencia de conformidad.</small></div>
  </div></section>

  {error&&<div className="error">{error}</div>}
  <div className="wizard-actions"><button type="button" className="btn btn-light" disabled={step===0} onClick={()=>setStep(v=>Math.max(0,v-1))}><ArrowLeft size={14}/>Atrás</button><div className="wizard-action-copy">{step<3&&<span>Podés volver y cambiar cualquier dato.</span>}</div>{step<3?<button type="button" className="btn btn-brand" onClick={nextStep}>Continuar <ArrowRight size={14}/></button>:<button className="btn btn-brand" disabled={busy||queued}>{busy?"Guardando...":queued?"Guardada offline":<><Check size={14}/>Emitir constancia</>}</button>}</div>
 </form>
}