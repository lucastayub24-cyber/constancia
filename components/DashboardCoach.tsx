"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {ChevronDown,Headphones,Lightbulb} from "lucide-react";

type Guide={title:string;explain:string;steps:string[];href?:string;cta?:string};
const guides:{match:(p:string)=>boolean;guide:Guide}[]=[
 {match:p=>p==="/dashboard",guide:{title:"Acá arrancás.",explain:"No hace falta configurar todo. Elegí una acción y hacé una cosa por vez.",steps:["Cargá el cliente","Creá el trabajo","Cuando terminás, emití la constancia"]}},
 {match:p=>p.startsWith("/dashboard/clientes"),guide:{title:"Cliente = a quién le trabajás.",explain:"Para empezar solo necesitás el nombre. Teléfono, email, CUIT y dirección pueden esperar.",steps:["Tocá Agregar cliente","Escribí el nombre","Guardá"],href:"/dashboard/clientes#nuevo",cta:"Agregar cliente"}},
 {match:p=>p.startsWith("/dashboard/activos"),guide:{title:"Equipo es opcional.",explain:"Usalo solo si querés historial separado por máquina, vehículo o instalación.",steps:["Elegí el cliente","Poné un nombre al equipo","Completá marca/serie solo si te sirve"],href:"/dashboard/activos#nuevo",cta:"Agregar equipo"}},
 {match:p=>p.startsWith("/dashboard/ordenes"),guide:{title:"Trabajo = lo que hay que hacer.",explain:"Con cliente + tarea ya podés crearlo. Fecha, técnico, equipo y prioridad son opcionales.",steps:["Elegí cliente","Escribí qué hay que hacer","Creá el trabajo"],href:"/dashboard/ordenes#nuevo",cta:"Nuevo trabajo"}},
 {match:p=>p.startsWith("/dashboard/presupuestos"),guide:{title:"Presupuesto = qué incluye y cuánto sale.",explain:"Agregá cliente, concepto y precio. Después compartís el link.",steps:["Elegí cliente","Agregá los ítems","Creá y compartí"],href:"/dashboard/presupuestos#nuevo",cta:"Nuevo presupuesto"}},
 {match:p=>p==="/dashboard/nueva",guide:{title:"Constancia = prueba de lo que hiciste.",explain:"Solo el primer paso es obligatorio. Fotos, cobro, firma y próximo service son opcionales.",steps:["Contá qué hiciste","Sumá evidencia si querés","Emití"]}},
 {match:p=>p.startsWith("/dashboard/caja")||p.startsWith("/dashboard/cuentas"),guide:{title:"Cobros sin contabilidad rara.",explain:"Ves quién debe, cuánto y de qué trabajo viene. Entrás, registrás el pago y listo.",steps:["Buscá el saldo","Abrí la constancia","Registrá el pago"]}},
 {match:p=>p.startsWith("/dashboard/agenda"),guide:{title:"Agenda = qué tenés que hacer y cuándo.",explain:"Acá no se configura nada: solo mirás los trabajos programados y entrás al que necesitás.",steps:["Mirá hoy","Abrí el trabajo","Actualizá desde ahí"]}},
 {match:p=>p.startsWith("/dashboard/configuracion"),guide:{title:"Configuración solo cuando haga falta.",explain:"Los datos básicos alcanzan. Mercado Pago se conecta una sola vez.",steps:["Completá tu empresa","Conectá Mercado Pago si vas a cobrar online","Guardá"]}},
 {match:p=>p.startsWith("/dashboard/"),guide:{title:"Esta herramienta es opcional.",explain:"Si no entendés para qué sirve, probablemente todavía no la necesitás. Podés volver a Inicio.",steps:["Usala solo si te resuelve algo","No completes campos porque sí","Soporte te ayuda si te trabás"]}},
];

export function DashboardCoach(){
 const p=usePathname();const g=guides.find(x=>x.match(p))?.guide;if(!g)return null;
 function help(){window.dispatchEvent(new CustomEvent("constancia:support",{detail:{prefill:"Estoy en "+p+" y necesito ayuda para "}}))}
 return <details className="dashboard-coach"><summary><span><Lightbulb size={15}/></span><div><b>{g.title}</b><small>{g.explain}</small></div><ChevronDown size={14}/></summary><div className="dashboard-coach-body"><ol>{g.steps.map(s=><li key={s}>{s}</li>)}</ol><div>{g.href&&g.cta&&<Link className="btn btn-brand" href={g.href}>{g.cta}</Link>}<button className="btn btn-light" type="button" onClick={help}><Headphones size={13}/>Preguntar a soporte</button></div></div></details>
}