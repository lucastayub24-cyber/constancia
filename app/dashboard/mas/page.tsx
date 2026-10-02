import Link from "next/link";import {ArrowRight,BarChart3,CalendarDays,CreditCard,FileCheck2,FileText,HelpCircle,Landmark,PackageSearch,PanelsTopLeft,Repeat2,Settings,UserPlus} from "lucide-react";
const items=[
 ["/dashboard/constancias","Constancias","Trabajos ya documentados, PDF, QR, firma y estado del cobro.",FileCheck2],
 ["/dashboard/activos","Equipos","Historial separado por máquina, vehículo o instalación.",PackageSearch],
 ["/dashboard/agenda","Agenda","Qué trabajos vienen y cuándo.",CalendarDays],
 ["/dashboard/presupuestos","Presupuestos","Cotizá, compartí y convertí lo aprobado en trabajo.",FileText],
 ["/dashboard/contratos","Abonos y recurrencia","Programá visitas repetidas y próximos services.",Repeat2],
 ["/dashboard/cuentas","Cuentas corrientes","Mirá quién debe y cuánto.",Landmark],
 ["/dashboard/reportes","Reportes","Facturación, cobros, márgenes y actividad.",BarChart3],
 ["/dashboard/plantillas","Plantillas","Reutilizá tareas y checklist que hacés seguido.",PanelsTopLeft],
 ["/dashboard/equipo","Mi equipo","Usuarios, técnicos e invitaciones.",UserPlus],
 ["/dashboard/facturacion","Plan y facturación","Tu plan de Constancia y suscripción.",CreditCard],
 ["/dashboard/configuracion","Configuración","Datos de empresa y Mercado Pago.",Settings],
 ["/dashboard/guia","Cómo se usa","Cinco pasos simples para arrancar.",HelpCircle],
] as const;
export default function MorePage(){return <><header className="page-head page-head-v3"><div><div className="eyebrow">MÁS</div><h1>Todo lo demás.</h1><p>No necesitás usar estas herramientas para empezar. Entrá solo cuando te hagan falta.</p></div></header><section className="more-tools-grid">{items.map(([href,title,text,I])=><Link href={href} key={href}><span><I size={18}/></span><div><b>{title}</b><small>{text}</small></div><ArrowRight size={14}/></Link>)}</section></>}