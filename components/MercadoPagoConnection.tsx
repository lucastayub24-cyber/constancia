"use client";
import {useRouter} from "next/navigation";
import {useState} from "react";
import {CheckCircle2,ExternalLink,Link2,Unlink} from "lucide-react";

export function MercadoPagoConnection({configured,connected,userId,expiresAt}:{configured:boolean;connected:boolean;userId:string|null;expiresAt:string|null}){
 const r=useRouter();const[busy,setBusy]=useState(false);
 async function disconnect(){
  if(!confirm("¿Desconectar esta cuenta de Mercado Pago? Los cobros online nuevos dejarán de estar disponibles."))return;
  setBusy(true);try{const x=await fetch("/api/mercadopago/disconnect",{method:"DELETE"});const j=await x.json();if(!x.ok)throw new Error(j.error||"No se pudo desconectar");r.refresh()}catch(e){alert(e instanceof Error?e.message:"No se pudo desconectar")}finally{setBusy(false)}
 }
 return <section className="panel mp-connect-panel">
  <div className="mp-connect-head"><div><div className="eyebrow">COBROS ONLINE</div><h2>Mercado Pago del profesional</h2><p>Los pagos de tus clientes se acreditan directamente en tu propia cuenta de Mercado Pago.</p></div>{connected?<span className="mp-connected"><CheckCircle2 size={15}/> Conectado</span>:<span className="pill">Sin conectar</span>}</div>
  {!configured?<div className="error">La aplicación de Constancia todavía necesita MERCADOPAGO_CLIENT_ID y MERCADOPAGO_CLIENT_SECRET para habilitar OAuth.</div>:connected?<div className="mp-account-box"><div><span>Cuenta vinculada</span><b>{userId?"Mercado Pago · "+userId:"Mercado Pago"}</b><small>{expiresAt?"Autorización vigente hasta "+new Date(expiresAt).toLocaleDateString("es-AR"):"La credencial se renueva automáticamente."}</small></div><button className="btn btn-light" type="button" disabled={busy} onClick={disconnect}><Unlink size={14}/>{busy?"Desconectando...":"Desconectar"}</button></div>:<div className="mp-connect-cta"><div><Link2 size={22}/><div><b>Vinculá tu cuenta una sola vez.</b><span>Constancia usará autorización OAuth. No tenés que copiar ni compartir tu Access Token.</span></div></div><a className="btn btn-brand" href="/api/mercadopago/connect">Conectar Mercado Pago <ExternalLink size={14}/></a></div>}
  <div className="mp-flow-note"><span>Cliente paga la constancia</span><b>→</b><span>Mercado Pago acredita al profesional</span><b>→</b><span>Constancia actualiza saldo y recibo</span></div>
 </section>
}