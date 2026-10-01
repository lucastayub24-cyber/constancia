"use client";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {useState} from "react";
import {ArrowRight,CheckCircle2,ClipboardCheck,FileCheck2,FileText,PackageCheck,ReceiptText,Trash2,UsersRound} from "lucide-react";

const steps=[
  {n:"01",t:"Cliente",d:"Abrí la ficha 360° y mirá cómo concentra datos, equipos, órdenes y cuenta corriente.",href:"/dashboard/clientes",I:UsersRound},
  {n:"02",t:"Activo",d:"Entrá al equipo demo y revisá QR, historial técnico, contratos y próximos services.",href:"/dashboard/activos",I:PackageCheck},
  {n:"03",t:"Presupuesto",d:"Mirá un presupuesto aprobado y cómo se relaciona con el trabajo posterior.",href:"/dashboard/presupuestos",I:FileText},
  {n:"04",t:"Orden",d:"Revisá checklist, GPS, materiales, tiempos y evidencia de ejecución.",href:"/dashboard/ordenes",I:ClipboardCheck},
  {n:"05",t:"Constancia",d:"Abrí la constancia con firma, cobro parcial, QR, próximo service y trazabilidad.",href:"/dashboard/constancias",I:FileCheck2},
  {n:"06",t:"Caja",d:"Terminá el recorrido viendo pago, saldo pendiente, recibo y cuenta corriente.",href:"/dashboard/caja",I:ReceiptText},
];

export function DemoOnboarding(){
  const router=useRouter();
  const[busy,setBusy]=useState(false);
  async function clear(){
    if(!confirm("¿Borrar todos los datos de ejemplo y dejar tu cuenta lista para empezar desde cero?"))return;
    setBusy(true);
    try{
      const r=await fetch("/api/demo/clear",{method:"DELETE"});
      const j=await r.json();
      if(!r.ok)throw new Error(j.error||"No se pudieron borrar los ejemplos.");
      router.refresh();
    }catch(e){alert(e instanceof Error?e.message:"No se pudieron borrar los ejemplos.");}
    finally{setBusy(false)}
  }
  return <section className="demo-onboarding">
    <div className="demo-onboarding-head">
      <div><div className="eyebrow">TU CUENTA YA VIENE CON UN EJEMPLO COMPLETO</div><h2>Recorré Constancia antes de cargar tus datos.</h2><p>Te dejamos un cliente, un equipo, un presupuesto, una orden, una constancia, un contrato, un pago y un próximo service conectados entre sí.</p></div>
      <div className="demo-badge"><CheckCircle2 size={18}/><div><b>Demo lista</b><span>Todo es editable</span></div></div>
    </div>
    <div className="demo-steps">{steps.map(({n,t,d,href,I})=><Link href={href} className="demo-step-card" key={n}><span>{n}</span><div className="demo-step-icon"><I size={18}/></div><div><b>{t}</b><p>{d}</p></div><ArrowRight size={15}/></Link>)}</div>
    <div className="demo-onboarding-foot"><div><b>¿Ya entendiste el flujo?</b><span>Borrá solamente los datos de ejemplo y empezá con tu operación real.</span></div><button type="button" className="btn btn-light" onClick={clear} disabled={busy}><Trash2 size={14}/>{busy?"Borrando...":"Borrar datos demo"}</button></div>
  </section>
}