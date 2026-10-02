"use client";
import {useEffect,useRef,useState} from "react";
import {Headphones,MessageCircle,Send,X,ChevronRight,CheckCircle2} from "lucide-react";

type Msg={id:string;sender:"USER"|"ADMIN";body:string;createdAt:string};
type Thread={id:string;status:string;messages:Msg[]};
const quick=[
 "¿Cómo creo un trabajo?",
 "¿Cómo cobro una constancia?",
 "¿Cómo agrego un cliente?",
 "Me trabé y no sé qué hacer",
];

export function SupportWidget(){
 const[open,setOpen]=useState(false);const[thread,setThread]=useState<Thread|null>(null);const[text,setText]=useState("");const[busy,setBusy]=useState(false);const[error,setError]=useState("");const[guest,setGuest]=useState(false);const[name,setName]=useState("");const[email,setEmail]=useState("");const[sent,setSent]=useState(false);const end=useRef<HTMLDivElement|null>(null);
 async function load(){try{const r=await fetch("/api/support",{cache:"no-store"});if(r.status===401){setGuest(true);return}if(!r.ok)return;const j=await r.json();setGuest(false);setThread(j.threads?.[0]||null)}catch{}}
 useEffect(()=>{load()},[]);
 useEffect(()=>{const handler=(e:Event)=>{const d=(e as CustomEvent<{prefill?:string}>).detail;setOpen(true);if(d?.prefill)setText(d.prefill)};window.addEventListener("constancia:support",handler as EventListener);return()=>window.removeEventListener("constancia:support",handler as EventListener)},[]);
 useEffect(()=>{if(!open||guest)return;load();const id=setInterval(load,4500);return()=>clearInterval(id)},[open,guest]);
 useEffect(()=>{end.current?.scrollIntoView({behavior:"smooth"})},[thread?.messages.length,open]);
 async function send(e?:React.FormEvent){e?.preventDefault();if(!text.trim())return;setBusy(true);setError("");try{const r=await fetch("/api/support",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:text,name,email,subject:"Consulta desde "+location.pathname,page:location.pathname})});const j=await r.json();if(!r.ok)throw new Error(j.error||"No se pudo enviar");setText("");if(guest)setSent(true);else await load()}catch(e){setError(e instanceof Error?e.message:"No se pudo enviar")}finally{setBusy(false)}}
 function useQuick(q:string){setText(q);if(!open)setOpen(true)}
 const unread=Boolean(thread?.messages?.length&&thread.messages[thread.messages.length-1]?.sender==="ADMIN");
 return <div className={"support-widget "+(open?"open":"")}>
  {open&&<section className="support-popover" aria-label="Soporte">
   <header><div><span><Headphones size={15}/> SOPORTE CONSTANCIA</span><b>Preguntá con tus palabras.</b><small>Respondemos por acá. Si no estamos conectados, el mensaje queda guardado.</small></div><button type="button" onClick={()=>setOpen(false)} aria-label="Cerrar soporte"><X size={17}/></button></header>
   {sent?<div className="support-sent-mini"><CheckCircle2 size={26}/><b>Mensaje recibido.</b><span>Te vamos a responder al email que dejaste.</span><button className="btn btn-light" onClick={()=>{setSent(false);setText("")}}>Enviar otra consulta</button></div>:<>
    {!thread?.messages?.length&&<div className="support-quick"><span>Preguntas comunes</span>{quick.map(q=><button type="button" key={q} onClick={()=>useQuick(q)}>{q}<ChevronRight size={13}/></button>)}</div>}
    {!guest&&<div className="support-chat">
     {!thread?.messages?.length?<div className="support-empty"><MessageCircle size={22}/><b>Estamos para destrabarte.</b><span>No hace falta saber cómo se llama la función. Contanos qué querés lograr.</span></div>:thread.messages.map(m=><div className={"support-msg "+(m.sender==="ADMIN"?"admin":"user")} key={m.id}><span>{m.sender==="ADMIN"?"Soporte Constancia":"Vos"}</span><p>{m.body}</p><small>{new Date(m.createdAt).toLocaleTimeString("es-AR",{hour:"2-digit",minute:"2-digit"})}</small></div>)}
     <div ref={end}/>
    </div>}
    <form className="support-compose" onSubmit={send}>
     {guest&&<div className="support-guest-fields"><input value={name} onChange={e=>setName(e.target.value)} placeholder="Tu nombre" required/><input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="Tu email" required/></div>}
     <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Ej. Quiero cobrar un trabajo y no encuentro dónde..." rows={3} required/>
     {error&&<div className="error">{error}</div>}
     <button className="btn btn-brand" disabled={busy||!text.trim()||(guest&&(!name.trim()||!email.trim()))}>{busy?"Enviando...":<><Send size={14}/>Enviar consulta</>}</button>
    </form>
   </>}
  </section>}
  <button className="support-fab" type="button" onClick={()=>setOpen(v=>!v)} aria-label="Abrir soporte"><Headphones size={19}/><span>Ayuda</span>{unread&&<i className="support-unread"/>}</button>
 </div>
}