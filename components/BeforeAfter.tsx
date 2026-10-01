import {ArrowRight,Check,MessageSquareText,FileSpreadsheet,FolderOpen,Clock3,Route,WalletCards,RefreshCcw} from "lucide-react";
import Link from "next/link";

const before=[
 {I:MessageSquareText,t:"Chats sueltos",d:"Fotos, pedidos y confirmaciones perdidos entre conversaciones."},
 {I:FileSpreadsheet,t:"Planillas paralelas",d:"Agenda, clientes y saldos actualizados a mano."},
 {I:FolderOpen,t:"PDFs sin contexto",d:"El comprobante existe, pero no está unido al equipo ni al historial."},
 {I:Clock3,t:"Seguimiento manual",d:"Acordarse del próximo service depende de una persona."},
];
const after=[
 {I:Route,t:"Una operación conectada",d:"Cliente → activo → presupuesto → OT → evidencia → constancia."},
 {I:Check,t:"Ejecución demostrable",d:"Checklist, GPS, horarios, fotos y firma en el mismo trabajo."},
 {I:WalletCards,t:"Cobro visible",d:"Pagos, saldos, recibos y cuenta corriente sin otra planilla."},
 {I:RefreshCcw,t:"Recurrencia automática",d:"Próximos services y contratos vuelven a generar trabajo."},
];
export function BeforeAfter(){
 return <section className="section before-after-section"><div className="container">
  <div className="section-intro"><div><div className="eyebrow">ANTES / DESPUÉS</div><h2>De administrar por memoria a operar con trazabilidad.</h2></div><p>Constancia no suma otra herramienta al desorden: reemplaza varios pasos manuales por un solo flujo visible.</p></div>
  <div className="before-after-grid">
   <article className="compare-column before"><div className="compare-head"><span>ANTES</span><b>La operación vive repartida.</b></div>{before.map(({I,t,d})=><div className="compare-row" key={t}><I size={18}/><div><b>{t}</b><p>{d}</p></div></div>)}</article>
   <div className="compare-arrow"><ArrowRight size={22}/></div>
   <article className="compare-column after"><div className="compare-head"><span>CON CONSTANCIA</span><b>Todo deja una huella.</b></div>{after.map(({I,t,d})=><div className="compare-row" key={t}><I size={18}/><div><b>{t}</b><p>{d}</p></div></div>)}</article>
  </div>
  <div className="compare-cta"><div><b>Probalo con una operación de ejemplo ya cargada.</b><span>No necesitás preparar datos para entender cómo funciona.</span></div><Link href="/registro" className="btn btn-brand">Verlo en mi cuenta <ArrowRight size={14}/></Link></div>
 </div></section>
}