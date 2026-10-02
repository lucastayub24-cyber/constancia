"use client";
import Link from "next/link";import {useRouter} from "next/navigation";import {useState} from "react";import {ArrowRight,CheckCircle2,ClipboardList,FileCheck2,ReceiptText,Trash2} from "lucide-react";
const shortcuts=[
 {t:"Ver un trabajo",d:"Mirá cómo se programa y ejecuta.",href:"/dashboard/ordenes",I:ClipboardList},
 {t:"Ver una constancia",d:"Fotos, firma, QR y saldo.",href:"/dashboard/constancias",I:FileCheck2},
 {t:"Ver un cobro",d:"Pago, recibo y cuenta corriente.",href:"/dashboard/caja",I:ReceiptText},
];
export function DemoOnboarding(){
 const router=useRouter();const[busy,setBusy]=useState(false);
 async function clear(){if(!confirm("¿Borrar los datos de ejemplo y empezar con tus propios clientes?"))return;setBusy(true);try{const r=await fetch("/api/demo/clear",{method:"DELETE"});const j=await r.json();if(!r.ok)throw new Error(j.error||"No se pudieron borrar los ejemplos.");router.refresh()}catch(e){alert(e instanceof Error?e.message:"No se pudieron borrar los ejemplos.")}finally{setBusy(false)}}
 return <section className="demo-onboarding demo-onboarding-v3"><div className="demo-onboarding-head"><div><div className="eyebrow">ESTO ES UN EJEMPLO</div><h2>Podés tocar todo sin miedo.</h2><p>Tu cuenta viene con datos ficticios para que veas cómo funciona. Cuando quieras, los borrás y empezás con los tuyos.</p></div><div className="demo-badge"><CheckCircle2 size={18}/><div><b>Cuenta demo</b><span>No son datos reales</span></div></div></div><div className="demo-shortcuts-v3">{shortcuts.map(({t,d,href,I})=><Link href={href} key={t}><span><I size={17}/></span><div><b>{t}</b><small>{d}</small></div><ArrowRight size={13}/></Link>)}</div><div className="demo-onboarding-foot"><div><b>¿Querés empezar de verdad?</b><span>Borrá el ejemplo. El sistema queda vacío y listo para tus datos.</span></div><button type="button" className="btn btn-light" onClick={clear} disabled={busy}><Trash2 size={13}/>{busy?"Borrando...":"Borrar ejemplo"}</button></div></section>
}