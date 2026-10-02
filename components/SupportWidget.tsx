"use client";
import {useEffect,useRef,useState} from "react";
import {Headphones,MessageCircle,Send,X} from "lucide-react";

type Msg={id:string;sender:"USER"|"ADMIN";body:string;createdAt:string};
type Thread={id:string;status:string;messages:Msg[]};

export function SupportWidget(){
 const[open,setOpen]=useState(false);const[thread,setThread]=useState<Thread|null>(null);const[text,setText]=useState("");const[busy,setBusy]=useState(false);const[error,setError]=useState("");const end=useRef<HTMLDivElement|null>(null);
 async function load(){try{const r=await fetch("/api/support",{cache:"no-store"});if(!r.ok)return;const j=await r.json();setThread(j.threads?.[0]||null)}catch{}}
 useEffect(()=>{if(!open)return;load();const id=setInterval(load,6000);return()=>clearInterval(id)},[open]);
 useEffect(()=>{end.current?.scrollIntoView({behavior:"smooth"})},[thread?.messages.length,open]);
 async function send(e:React.FormEvent){e.preventDefault();if(!text.trim())return;setBusy(true);setError("");try{const r=await fetch("/api/support",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:text})});const j=await r.json();if(!r.ok)throw new Error(j.error||"No se pudo enviar");setText("");await load()}catch(e){setError(e instanceof Error?e.message:"No se pudo enviar")}finally{setBusy(false)}}
 return <div className={"support-widget "+(open?"open":"")}>
  {open&&<section className="support-popover" aria-label="Soporte">
   <header><div><span><Headphones size={15}/> SOPORTE</span><b>¿En qué te ayudamos?</b><small>Si estamos conectados respondemos por acá. Si no, tu mensaje queda guardado.</small></div><button type="button" onClick={()=>setOpen(false)} aria-label="Cerrar soporte"><X size={17}/></button></header>
   <div className="support-chat">
    {!thread?.messages?.length?<div className="support-empty"><MessageCircle size={22}/><b>Preguntanos lo que necesites.</b><span>Podés escribir “¿cómo creo un trabajo?” o contarnos dónde te trabaste.</span></div>:thread.messages.map(m=><div className={"support-msg "+(m.sender==="ADMIN"?"admin":"user")} key={m.id}><span>{m.sender==="ADMIN"?"Soporte Constancia":"Vos"}</span><p>{m.body}</p><small>{new Date(m.createdAt).toLocaleTimeString("es-AR",{hour:"2-digit",minute:"2-digit"})}</small></div>)}
    <div ref={end}/>
   </div>
   <form className="support-compose" onSubmit={send}><textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Escribí tu pregunta..." rows={2}/>{error&&<div className="error">{error}</div>}<button className="btn btn-brand" disabled={busy||!text.trim()}>{busy?"Enviando...":<><Send size={14}/>Enviar</>}</button></form>
  </section>}
  <button className="support-fab" type="button" onClick={()=>setOpen(v=>!v)} aria-label="Abrir soporte"><Headphones size={19}/><span>Soporte</span></button>
 </div>
}