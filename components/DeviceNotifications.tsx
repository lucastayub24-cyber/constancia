"use client";
import {useEffect,useState} from "react";
import {BellRing,CheckCircle2,X} from "lucide-react";

function keyBytes(base64:string){
 const pad="=".repeat((4-base64.length%4)%4);const b64=(base64+pad).replace(/-/g,"+").replace(/_/g,"/");
 const raw=atob(b64);return Uint8Array.from([...raw].map(c=>c.charCodeAt(0)));
}
export function DeviceNotifications(){
 const[show,setShow]=useState(false);const[busy,setBusy]=useState(false);const[enabled,setEnabled]=useState(false);const[msg,setMsg]=useState("");
 useEffect(()=>{(async()=>{
  if(!("serviceWorker" in navigator)||!("PushManager" in window)||!("Notification" in window))return;
  if(Notification.permission==="denied")return;
  const reg=await navigator.serviceWorker.ready.catch(()=>null);const sub=await reg?.pushManager.getSubscription().catch(()=>null);
  if(sub){setEnabled(true);return}
  if(Notification.permission==="default"&&localStorage.getItem("constancia-push-dismissed")!=="1")setShow(true);
  if(Notification.permission==="granted")setShow(true);
 })()},[]);
 async function enable(){
  setBusy(true);setMsg("");
  try{
   const permission=await Notification.requestPermission();if(permission!=="granted")throw new Error("No se habilitaron las notificaciones.");
   const cfg=await fetch("/api/push/subscribe",{cache:"no-store"});const cj=await cfg.json();if(!cfg.ok)throw new Error(cj.error||"No se pudo preparar el dispositivo.");
   const reg=await navigator.serviceWorker.ready;let sub=await reg.pushManager.getSubscription();
   if(!sub)sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:keyBytes(cj.publicKey)});
   const json=sub.toJSON();
   const r=await fetch("/api/push/subscribe",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(json)});const j=await r.json();if(!r.ok)throw new Error(j.error||"No se pudo registrar el dispositivo.");
   setEnabled(true);setShow(false);localStorage.removeItem("constancia-push-dismissed");
   await fetch("/api/push/test",{method:"POST"}).catch(()=>undefined);
  }catch(e){setMsg(e instanceof Error?e.message:"No se pudo activar.")}finally{setBusy(false)}
 }
 function dismiss(){localStorage.setItem("constancia-push-dismissed","1");setShow(false)}
 if(enabled||!show)return null;
 return <aside className="device-push-prompt"><div className="device-push-icon"><BellRing size={20}/></div><div><b>Recibí avisos aunque Constancia esté cerrada.</b><span>Trabajos próximos, respuestas de soporte, cobros y recordatorios importantes.</span>{msg&&<small>{msg}</small>}</div><button className="btn btn-brand" onClick={enable} disabled={busy}>{busy?"Activando...":"Activar alertas"}</button><button className="device-push-close" onClick={dismiss} aria-label="Ahora no"><X size={15}/></button></aside>;
}

export function DeviceNotificationSettings(){
 const[state,setState]=useState<"checking"|"unsupported"|"blocked"|"off"|"on">("checking");const[busy,setBusy]=useState(false);
 async function check(){
  if(!("serviceWorker" in navigator)||!("PushManager" in window)||!("Notification" in window)){setState("unsupported");return}
  if(Notification.permission==="denied"){setState("blocked");return}
  const reg=await navigator.serviceWorker.ready.catch(()=>null);const sub=await reg?.pushManager.getSubscription().catch(()=>null);setState(sub?"on":"off");
 }
 useEffect(()=>{check()},[]);
 async function activate(){setBusy(true);try{
  const permission=await Notification.requestPermission();if(permission!=="granted"){await check();return}
  const cfg=await fetch("/api/push/subscribe",{cache:"no-store"});const cj=await cfg.json();const reg=await navigator.serviceWorker.ready;let sub=await reg.pushManager.getSubscription();if(!sub)sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:keyBytes(cj.publicKey)});
  await fetch("/api/push/subscribe",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(sub.toJSON())});await fetch("/api/push/test",{method:"POST"});await check();
 }finally{setBusy(false)}}
 return <section className="panel device-settings"><div><div className="device-push-icon"><BellRing size={18}/></div><div><h2>Notificaciones del dispositivo</h2><p>Recibí avisos de Constancia como una app, incluso si no está abierta.</p></div></div><div>{state==="on"?<span className="pill paid"><CheckCircle2 size={12}/> Activadas</span>:state==="blocked"?<span className="pill pending">Bloqueadas en el dispositivo</span>:state==="unsupported"?<span className="pill">No compatible en este navegador</span>:<button className="btn btn-brand" onClick={activate} disabled={busy}>{busy?"Activando...":"Activar notificaciones"}</button>}</div></section>;
}