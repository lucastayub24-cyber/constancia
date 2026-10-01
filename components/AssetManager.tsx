"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
import {useRouter} from "next/navigation";
import {ExternalLink,QrCode,Archive} from "lucide-react";

type Client={id:string;name:string};
type Asset={id:string;assetNumber:number;publicCode:string;name:string;category:string|null;brand:string|null;model:string|null;serialNumber:string|null;location:string|null;status:string;client:{id:string;name:string};_count:{certificates:number;workOrders:number}};
const blank={clientId:"",name:"",category:"",brand:"",model:"",serialNumber:"",location:"",notes:"",installedAt:"",warrantyUntil:""};

export function AssetManager({clients}:{clients:Client[]}){
 const r=useRouter();const[assets,setAssets]=useState<Asset[]>([]);const[form,setForm]=useState(blank);const[error,setError]=useState("");const[busy,setBusy]=useState(false);
 async function load(){const x=await fetch("/api/assets");const j=await x.json();setAssets(j.assets||[])}
 useEffect(()=>{load()},[]);
 async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);setError("");try{const res=await fetch("/api/assets",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});const j=await res.json();if(!res.ok)throw new Error(j.error);setForm(blank);await load();r.refresh()}catch(e){setError(e instanceof Error?e.message:"Error")}finally{setBusy(false)}}
 async function retire(id:string){if(!confirm("¿Retirar este activo? El historial se conserva."))return;await fetch("/api/assets/"+id,{method:"DELETE"});await load();r.refresh()}
 return <><form className="panel form" onSubmit={submit}><h2>Nuevo equipo / activo</h2><div className="form-grid">
  <label className="field">Cliente<select className="select" required value={form.clientId} onChange={e=>setForm({...form,clientId:e.target.value})}><option value="">Seleccionar</option>{clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
  <label className="field">Nombre del equipo<input className="input" required placeholder="Ej. Split oficina / Camión 12" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label>
  <label className="field">Categoría<input className="input" placeholder="Aire acondicionado, vehículo, bomba..." value={form.category} onChange={e=>setForm({...form,category:e.target.value})}/></label>
  <label className="field">Ubicación<input className="input" placeholder="Oficina, planta, patente..." value={form.location} onChange={e=>setForm({...form,location:e.target.value})}/></label>
  <label className="field">Marca<input className="input" value={form.brand} onChange={e=>setForm({...form,brand:e.target.value})}/></label>
  <label className="field">Modelo<input className="input" value={form.model} onChange={e=>setForm({...form,model:e.target.value})}/></label>
  <label className="field">N.º de serie<input className="input" value={form.serialNumber} onChange={e=>setForm({...form,serialNumber:e.target.value})}/></label>
  <label className="field">Instalado el<input className="input" type="date" value={form.installedAt} onChange={e=>setForm({...form,installedAt:e.target.value})}/></label>
  <label className="field">Garantía hasta<input className="input" type="date" value={form.warrantyUntil} onChange={e=>setForm({...form,warrantyUntil:e.target.value})}/></label>
  <label className="field full">Notas<textarea className="textarea" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/></label>
 </div>{error&&<div className="error">{error}</div>}<div className="actions"><button className="btn btn-brand" disabled={busy||clients.length===0}>{busy?"Guardando...":"Crear activo"}</button></div></form>
 <section className="table-card">{assets.length===0?<p className="muted" style={{padding:24}}>Todavía no cargaste equipos o activos.</p>:assets.map(a=><div className="table-row" style={{gridTemplateColumns:"90px 1fr 170px 130px"}} key={a.id}><span className="money">A-{String(a.assetNumber).padStart(5,"0")}</span><div><b>{a.name}</b><div className="muted">{a.client.name} · {[a.brand,a.model,a.serialNumber].filter(Boolean).join(" · ")||a.category||"Sin identificación"}</div></div><span>{a._count.certificates} services · {a._count.workOrders} órdenes</span><div style={{display:"flex",gap:4}}><Link className="btn btn-light" href={"/dashboard/activo/"+a.id} aria-label="Ver activo"><ExternalLink size={14}/></Link><Link className="btn btn-light" href={"/a/"+a.publicCode} target="_blank" aria-label="Abrir QR público"><QrCode size={14}/></Link><button className="btn btn-light" onClick={()=>retire(a.id)} aria-label="Retirar"><Archive size={14}/></button></div></div>)}</section></>
}