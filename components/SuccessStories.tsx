import Image from "next/image";
import Link from "next/link";
import {ArrowRight,CheckCircle2,Quote} from "lucide-react";

const stories=[
 {image:"/cases/climasur.svg",sector:"CLIMATIZACIÓN",company:"ClimaSur Servicios",person:"Martín · técnico independiente",quote:"Antes terminaba el trabajo y después tenía que reconstruir todo por WhatsApp. Ahora cierro la visita con fotos, constancia y saldo en el mismo momento.",before:"Fotos sueltas, audios y cobros anotados aparte.",after:"Cada visita queda vinculada al cliente, el equipo y el próximo service.",wins:["Evidencia ordenada","Constancia al terminar","Cobro visible para el cliente"]},
 {image:"/cases/electrorios.svg",sector:"MANTENIMIENTO INDUSTRIAL",company:"Electro Ríos",person:"Laura · administración",quote:"Lo que más nos cambia es saber qué se hizo en cada máquina sin preguntarle a tres personas. El historial queda ahí.",before:"Planilla para agenda, otra para equipos y PDFs separados.",after:"Órdenes, checklist, materiales e historial técnico en una sola ficha.",wins:["Historial por equipo","Trabajo asignado al técnico","Seguimiento de materiales"]},
 {image:"/cases/agrocampo.svg",sector:"SERVICIOS PARA AGRO",company:"AgroCampo Técnica",person:"Nicolás · servicio en campo",quote:"En el campo necesito algo que pueda usar rápido desde el teléfono. Abro el trabajo, saco fotos, marco lo que hice y sigo.",before:"La información volvía del campo días después.",after:"El trabajo se documenta desde el lugar y administración lo ve enseguida.",wins:["Uso desde celular","GPS y fotos por etapa","Próxima visita programada"]},
];

export function SuccessStories(){
 return <section className="section success-stories-section"><div className="container">
  <div className="section-intro success-intro"><div><div className="eyebrow">HISTORIAS DE USO</div><h2>Así se siente cuando dejás de administrar por memoria.</h2></div><div><p>Escenarios ilustrativos basados en problemas comunes de empresas de servicios.</p><small>Empresas, personas e imágenes ficticias. Los mostramos para que puedas imaginar el uso real sin inventar testimonios de clientes.</small></div></div>
  <div className="success-grid">{stories.map((s,i)=><article className={"success-card success-card-"+i} key={s.company}>
   <div className="success-photo"><Image src={s.image} alt={"Imagen ilustrativa de "+s.sector.toLowerCase()} fill unoptimized sizes="(max-width: 900px) 100vw, 33vw"/><span>IMAGEN ILUSTRATIVA</span></div>
   <div className="success-body"><div className="success-sector">{s.sector}</div><h3>{s.company}</h3><p className="success-person">{s.person}</p><div className="success-quote"><Quote size={17}/><p>{s.quote}</p></div><div className="success-before-after"><div><span>ANTES</span><p>{s.before}</p></div><div><span>CON CONSTANCIA</span><p>{s.after}</p></div></div><div className="success-wins">{s.wins.map(x=><span key={x}><CheckCircle2 size={13}/>{x}</span>)}</div></div>
  </article>)}</div>
  <div className="success-cta"><div><b>¿Tu día se parece a alguno de estos?</b><span>Entrá con una cuenta de ejemplo y recorré el flujo completo.</span></div><Link className="btn btn-brand" href="/registro">Probar gratis <ArrowRight size={14}/></Link></div>
 </div></section>
}