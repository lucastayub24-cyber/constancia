"use client";
import {useRouter} from "next/navigation";
import {useEffect,useState} from "react";
import {CheckCircle2,CreditCard,LoaderCircle} from "lucide-react";

export function PublicCertificatePayment({code,balanceCents,currency,connected,initialStatus,paymentReturn}:{code:string;balanceCents:string;currency:string;connected:boolean;initialStatus:string;paymentReturn?:string}){
 const r=useRouter();const[busy,setBusy]=useState(false);const[status,setStatus]=useState(initialStatus);const[error,setError]=useState("");
 const balance=BigInt(balanceCents);
 useEffect(()=>{if(!paymentReturn||status==="PAID")return;let tries=0;const id=setInterval(async()=>{tries++;try{const x=await fetch("/api/public/certificates/"+encodeURIComponent(code)+"/payment-status",{cache:"no-store"});if(x.ok){const j=await x.json();setStatus(j.paymentStatus);if(j.paymentStatus==="PAID"){clearInterval(id);r.refresh()}}}catch{}if(tries>=12)clearInterval(id)},1800);return()=>clearInterval(id)},[paymentReturn,status,code,r]);
 async function pay(){setBusy(true);setError("");try{const x=await fetch("/api/public/certificates/"+encodeURIComponent(code)+"/pay",{method:"POST"});const j=await x.json();if(!x.ok)throw new Error(j.error||"No se pudo iniciar el pago.");window.location.href=j.url}catch(e){setError(e instanceof Error?e.message:"No se pudo iniciar el pago.");setBusy(false)}}
 const formatted=new Intl.NumberFormat("es-AR",{style:"currency",currency:currency||"ARS",maximumFractionDigits:0}).format(Number(balance)/100);
 if(status==="PAID"||balance<=0n)return <div className="public-payment-success"><CheckCircle2 size={22}/><div><b>Pago completo</b><span>Esta constancia no tiene saldo pendiente.</span></div></div>;
 if(!connected)return <div className="public-payment-disabled"><div><b>Saldo pendiente: {formatted}</b><span>El profesional todavía no habilitó cobro online por Mercado Pago.</span></div></div>;
 return <div className="public-payment-cta"><div><span>SALDO PENDIENTE</span><strong>{formatted}</strong><small>El pago se acredita directamente en la cuenta de Mercado Pago del profesional.</small></div><button type="button" className="btn btn-brand" onClick={pay} disabled={busy}>{busy?<><LoaderCircle size={14}/>Abriendo...</>:<><CreditCard size={14}/>Pagar saldo</>}</button>{paymentReturn&&status!=="PAID"&&<div className="public-payment-checking"><LoaderCircle size={13}/> Verificando acreditación…</div>}{error&&<div className="error">{error}</div>}</div>
}