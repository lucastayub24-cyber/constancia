"use client";
import Link from "next/link";
import {useEffect,useMemo,useState} from "react";
import {useRouter} from "next/navigation";
type Client={id:string;name:string};
type Asset={id:string;clientId:string;name:string;assetNumber:number};
type Member={id:string;name:string};
type Template={id:string;name:string;defaultTitle:string;defaultDescription:string;defaultDurationMinutes:number|null};
type Row={id:string;sequentialNumber:number;title:string;status:string;priority:string;scheduledStart:string|null;client:{name:string};asset:{name:string}|null;assignedUser:{name:string}|null;certificate:{id:string}|null};

const labels:Record<string,string>={SCHEDULED:"Programada",EN_ROUTE:"En camino",IN_PROGRESS:"En curso",WAITING_PART:"Esperando repuesto",COMPLETED:"Completada",CANCELED:"Cancelada"};
const blank={clientId:"",assetId:"",templateId:"",assignedUserId:"",priority:"NORMAL",title:"",description:"",serviceAddress:"",scheduledStart:"",scheduledEnd:"",internalNotes:""};

export function WorkOrderManager({clients,assets,members,templates}:{clients:Client[];assets:Asset[];members:Member[];templates:Template[]}){
 const r=useRouter();const[rows,setRows]=useState<Row[]>([]);const[form,setForm]=useState(blank);const[error,setError]=useState("");const[busy,setBusy]=useState(false);
 const filtered=useMemo(()=>assets.filter(a=>!form.clientId||a.clientId===form.clientId),[assets,form.clientId]);
 async function load(){const x=await fetch("/api/work-orders");const j=await x.json();setRows(j.workOrders||[])}
 useEffect(()=>{load()},[]);
 function chooseTemplate(id:string){const t=templates.find(x=>x.id===id);setForm(f=>({...f,templateId:id,title:t?.defaultTitle||f.title,description:t?.defaultDescription||f.description}))}
 async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);setError("");try{const res=await fetch("/api/work-orders",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});const j=await res.json();if(!res.ok)throw new Error(j.error);setForm(blank);await load();r.refresh()}catch(e){setError(e instanceof Error?e.message:"Error")}finally{setBusy(false)}}
 return <><form className="panel form" onSubmit={submit}><h2>Nueva orden de trabajo</h2><div className="form-grid">
 <label className="field">Cliente<select className="select" value={form.clientId} required onChange={e=>setForm({...form,clientId:e.target.value,assetId:""})}><option value="">Seleccionar</option>{clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
 <label className="field">Equipo / activo<select className="select" value={form.assetId} onChange={e=>setForm({...form,assetId:e.target.value})}><option value="">Sin activo específico</option>{filtered.map(a=><option key={a.id} value={a.id}>A-{String(a.assetNumber).padStart(5,"0")} · {a.name}</option>)}</select></label>
 <label className="field">Plantilla<select className="select" value={form.templateId} onChange={e=>chooseTemplate(e.target.value)}><option value="">Sin plantilla</option>{templates.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></label>
 <label className="field">Técnico asignado<select className="select" value={form.assignedUserId} onChange={e=>setForm({...form,assignedUserId:e.target.value})}><option value="">Sin asignar</option>{members.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select></label>
 <label className="field">Prioridad<select className="select" value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}><option value="LOW">Baja</option><option value="NORMAL">Normal</option><option value="HIGH">Alta</option><option value="URGENT">Urgente</option></select></label>
 <label className="field">Inicio programado<input className="input" type="datetime-local" value={form.scheduledStart} onChange={e=>setForm({...form,scheduledStart:e.target.value})}/></label>
 <label className="field">Fin estimado<input className="input" type="datetime-local" value={form.scheduledEnd} onChange={e=>setForm({...form,scheduledEnd:e.target.value})}/></label>
 <label className="field">Dirección<input className="input" value={form.serviceAddress} onChange={e=>setForm({...form,serviceAddress:e.target.value})}/></label>
 <label className="field full">Título<input className="input" required value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></label>
 <label className="field full">Descripción<textarea className="textarea" required value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label>
 <label className="field full">Nota interna<textarea className="textarea" value={form.internalNotes} onChange={e=>setForm({...form,internalNotes:e.target.value})}/></label>
 </div>{error&&<div className="error">{error}</div>}<div className="actions"><button className="btn btn-brand" disabled={busy}>{busy?"Creando...":"Crear orden"}</button></div></form>
 <section className="table-card">{rows.length===0?<p className="muted" style={{padding:24}}>No hay órdenes de trabajo.</p>:rows.map(w=><Link href={"/dashboard/orden/"+w.id} className="table-row" style={{gridTemplateColumns:"90px 1fr 150px 120px"}} key={w.id}><span className="money">OT-{String(w.sequentialNumber).padStart(5,"0")}</span><div><b>{w.title}</b><div className="muted">{w.client.name}{w.asset?" · "+w.asset.name:""}{w.assignedUser?" · "+w.assignedUser.name:""}</div></div><span>{w.scheduledStart?new Date(w.scheduledStart).toLocaleString("es-AR",{dateStyle:"short",timeStyle:"short"}):"Sin fecha"}</span><span className={"pill wo-"+w.status.toLowerCase()}>{labels[w.status]||w.status}</span></Link>)}</section></>
}