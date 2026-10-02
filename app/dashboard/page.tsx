import Link from "next/link";
import {ArrowRight,CalendarDays,Check,CircleDollarSign,ClipboardList,FileCheck2,FilePlus2,PackageSearch,Plus,UserPlus,UsersRound,Wrench} from "lucide-react";
import {db} from "@/lib/db";import {activeOrganization} from "@/lib/org";import {moneyCents} from "@/lib/utils";import {DemoOnboarding} from "@/components/DemoOnboarding";import {DemoStarter} from "@/components/DemoStarter";import {DEMO_MARKER} from "@/lib/demo-data";

const labels:Record<string,string>={SCHEDULED:"Programado",EN_ROUTE:"En camino",IN_PROGRESS:"Trabajando",WAITING_PART:"Esperando repuesto",COMPLETED:"Terminado",CANCELED:"Cancelado"};
export default async function Dashboard(){
 const{organization}=await activeOrganization();const now=new Date();const monthStart=new Date(now.getFullYear(),now.getMonth(),1);const todayStart=new Date(now);todayStart.setHours(0,0,0,0);const tomorrow=new Date(todayStart);tomorrow.setDate(tomorrow.getDate()+1);const next7=new Date(todayStart);next7.setDate(next7.getDate()+7);
 const[clients,assets,orders,certs,payments,todayOrders,upcoming,contracts,demoClients,quotes,totalPayments]=await Promise.all([
  db.client.count({where:{organizationId:organization.id}}),
  db.asset.count({where:{organizationId:organization.id,status:"ACTIVE"}}),
  db.workOrder.findMany({where:{organizationId:organization.id},include:{client:true,asset:true,assignedUser:true},orderBy:{createdAt:"desc"},take:100}),
  db.certificate.findMany({where:{organizationId:organization.id,status:{not:"VOID"}},include:{client:true,asset:true,servicePayments:true,workOrder:{include:{materials:true}}},orderBy:{createdAt:"desc"},take:300}),
  db.certificatePayment.findMany({where:{certificate:{organizationId:organization.id},paidAt:{gte:monthStart}},select:{amountCents:true}}),
  db.workOrder.findMany({where:{organizationId:organization.id,status:{notIn:["COMPLETED","CANCELED"]},scheduledStart:{gte:todayStart,lt:tomorrow}},include:{client:true,asset:true,assignedUser:true},orderBy:{scheduledStart:"asc"}}),
  db.workOrder.findMany({where:{organizationId:organization.id,status:{notIn:["COMPLETED","CANCELED"]},scheduledStart:{gte:tomorrow,lte:next7}},include:{client:true,asset:true},orderBy:{scheduledStart:"asc"},take:6}),
  db.maintenanceContract.count({where:{organizationId:organization.id,status:"ACTIVE"}}),
  db.client.count({where:{organizationId:organization.id,notes:{contains:DEMO_MARKER}}}),
  db.quote.count({where:{organizationId:organization.id}}),
  db.certificatePayment.count({where:{certificate:{organizationId:organization.id}}})
 ]);
 const monthCerts=certs.filter(c=>c.createdAt>=monthStart);const billed=monthCerts.reduce((s,c)=>s+(c.totalAmountCents||0n),0n);const collected=payments.reduce((s,p)=>s+p.amountCents,0n);
 const outstanding=certs.reduce((s,c)=>{if(c.totalAmountCents===null)return s;const paid=c.servicePayments.reduce((a,p)=>a+p.amountCents,0n);return s+(c.totalAmountCents>paid?c.totalAmountCents-paid:0n)},0n);
 const openOrders=orders.filter(x=>!["COMPLETED","CANCELED"].includes(x.status));const inProgress=orders.filter(x=>x.status==="IN_PROGRESS").length;
 const materialCost=monthCerts.reduce((sum,c)=>sum+(c.workOrder?.materials||[]).reduce((s,m)=>s+(m.unitCostCents?BigInt(Math.round(Number(m.quantity)*1000))*m.unitCostCents/1000n:0n),0n),0n);
 const margin=billed>materialCost?billed-materialCost:0n;const collectionRate=billed>0n?Math.min(100,Math.round(Number(collected*10000n/billed)/100)):0;
 const dueSoon=certs.filter(c=>c.nextServiceAt&&c.nextServiceAt>=now&&c.nextServiceAt<=next7).length;
 const showDemoStarter=demoClients===0&&clients===0&&assets===0&&orders.length===0&&certs.length===0;
 const setup=[
  {label:"Cargá tu primer cliente",done:clients>0,href:"/dashboard/clientes#nuevo"},
  {label:"Registrá un equipo si lo necesitás",done:assets>0,href:"/dashboard/activos#nuevo"},
  {label:"Creá tu primer trabajo",done:orders.length>0,href:"/dashboard/ordenes#nuevo"},
  {label:"Emití una constancia",done:certs.length>0,href:"/dashboard/nueva"},
  {label:"Registrá un cobro",done:totalPayments>0,href:"/dashboard/caja"},
 ];
 const setupDone=setup.filter(x=>x.done).length;const nextStep=setup.find(x=>!x.done);
 return <>{demoClients>0&&<DemoOnboarding/>}{showDemoStarter&&<DemoStarter/>}
 <header className="home-v3-head"><div><span className="eyebrow">INICIO</span><h1>¿Qué necesitás hacer?</h1><p>{organization.name} · Elegí una acción y Constancia te guía paso a paso.</p></div><Link className="btn btn-brand home-main-cta" href="/dashboard/ordenes#nuevo"><Plus size={15}/>Nuevo trabajo</Link></header>

 {demoClients===0&&setupDone<setup.length&&<section className="simple-setup"><div className="simple-setup-copy"><span className="eyebrow">PRIMEROS PASOS</span><h2>{setupDone===0?"Arranquemos por lo básico.":"Ya falta poco."}</h2><p>No necesitás configurar todo. Hacé una cosa por vez.</p></div><div className="simple-setup-progress"><div><b>{setupDone}/{setup.length}</b><span>listo</span></div><div className="setup-progress-bar"><i style={{width:(setupDone/setup.length*100)+"%"}}/></div></div>{nextStep&&<Link className="simple-next-step" href={nextStep.href}><span>{setupDone+1}</span><div><small>AHORA HACÉ ESTO</small><b>{nextStep.label}</b></div><ArrowRight size={16}/></Link>}<div className="simple-step-list">{setup.map((x,i)=><Link href={x.href} key={x.label} className={x.done?"done":""}><span>{x.done?<Check size={11}/>:i+1}</span>{x.label}</Link>)}</div></section>}

 <section className="home-actions-v3">
  <Link href="/dashboard/ordenes#nuevo" className="home-action primary"><span><ClipboardList size={21}/></span><div><b>Crear un trabajo</b><small>Programar qué hay que hacer y quién lo hace.</small></div><ArrowRight size={17}/></Link>
  <Link href="/dashboard/clientes#nuevo" className="home-action"><span><UserPlus size={21}/></span><div><b>Agregar cliente</b><small>Persona o empresa a la que le trabajás.</small></div><ArrowRight size={17}/></Link>
  <Link href="/dashboard/nueva" className="home-action"><span><FilePlus2 size={21}/></span><div><b>Hacer constancia</b><small>Dejar documentado un trabajo terminado.</small></div><ArrowRight size={17}/></Link>
  <Link href="/dashboard/caja" className="home-action"><span><CircleDollarSign size={21}/></span><div><b>Registrar un cobro</b><small>Ver pendientes y cargar pagos.</small></div><ArrowRight size={17}/></Link>
 </section>

 <section className="attention-v3"><div className="attention-title"><div><span className="eyebrow">LO IMPORTANTE AHORA</span><h2>Sin vueltas.</h2></div></div><div className="attention-grid">
  <Link href="/dashboard/agenda"><CalendarDays size={18}/><div><b>{todayOrders.length}</b><span>trabajo{todayOrders.length===1?"":"s"} para hoy</span></div></Link>
  <Link href="/dashboard/ordenes"><ClipboardList size={18}/><div><b>{openOrders.length}</b><span>trabajo{openOrders.length===1?"":"s"} abierto{openOrders.length===1?"":"s"}</span></div></Link>
  <Link href="/dashboard/caja"><CircleDollarSign size={18}/><div><b>{moneyCents(outstanding)}</b><span>pendiente de cobro</span></div></Link>
  <Link href="/dashboard/notificaciones"><Wrench size={18}/><div><b>{dueSoon}</b><span>próximo{dueSoon===1?"":"s"} service{dueSoon===1?"":"s"}</span></div></Link>
 </div></section>

 <div className="dashboard-grid dashboard-grid-v3">
  <section className="panel dashboard-panel"><div className="panel-title-row"><div><h2>Hoy</h2><span className="muted">Lo que tenés que atender hoy.</span></div><Link href="/dashboard/agenda">Ver agenda</Link></div>{todayOrders.length===0?<div className="empty-state simple-empty"><Check size={18}/><b>No tenés trabajos programados para hoy.</b><span>Podés crear uno cuando lo necesites.</span></div>:todayOrders.map(w=><Link className="today-job" href={"/dashboard/orden/"+w.id} key={w.id}><time>{w.scheduledStart?.toLocaleTimeString("es-AR",{hour:"2-digit",minute:"2-digit"})}</time><div><b>{w.title}</b><small>{w.client.name}{w.asset?" · "+w.asset.name:""}{w.assignedUser?" · "+w.assignedUser.name:""}</small></div><span className={"pill wo-"+w.status.toLowerCase()}>{labels[w.status]||w.status}</span></Link>)}</section>
  <section className="panel dashboard-panel"><div className="panel-title-row"><div><h2>Después</h2><span className="muted">Próximos trabajos de la semana.</span></div><Link href="/dashboard/agenda">Ver todo</Link></div>{upcoming.length===0?<div className="empty-state simple-empty"><CalendarDays size={18}/><b>La semana está despejada.</b></div>:upcoming.map(w=><Link className="upcoming-job" href={"/dashboard/orden/"+w.id} key={w.id}><div className="date-box"><b>{w.scheduledStart?.toLocaleDateString("es-AR",{day:"2-digit"})}</b><span>{w.scheduledStart?.toLocaleDateString("es-AR",{month:"short"})}</span></div><div><b>{w.title}</b><small>{w.client.name}{w.asset?" · "+w.asset.name:""}</small></div></Link>)}</section>
 </div>

 <details className="home-details-v3"><summary><div><b>Ver números y actividad</b><span>Facturación, cobros, clientes, equipos y últimos trabajos.</span></div><ArrowRight size={15}/></summary><div className="home-details-body">
  <section className="kpi-grid"><div className="kpi-card"><span>Facturado este mes</span><strong>{moneyCents(billed)}</strong><small>{collectionRate}% cobrado</small><div className="kpi-track"><i style={{width:collectionRate+"%"}}/></div></div><div className="kpi-card"><span>Cobrado este mes</span><strong>{moneyCents(collected)}</strong><small>Saldo total {moneyCents(outstanding)}</small></div><div className="kpi-card"><span>Margen estimado</span><strong>{moneyCents(margin)}</strong><small>Facturación menos materiales cargados</small></div><div className="kpi-card"><span>En curso ahora</span><strong>{inProgress}</strong><small>trabajos trabajando</small></div></section>
  <section className="ops-strip"><Link href="/dashboard/clientes"><UsersRound size={18}/><div><b>{clients}</b><span>Clientes</span></div></Link><Link href="/dashboard/activos"><PackageSearch size={18}/><div><b>{assets}</b><span>Equipos</span></div></Link><Link href="/dashboard/ordenes"><ClipboardList size={18}/><div><b>{openOrders.length}</b><span>Trabajos abiertos</span></div></Link><Link href="/dashboard/contratos"><CalendarDays size={18}/><div><b>{contracts}</b><span>Abonos activos</span></div></Link></section>
  <section className="table-card"><div className="panel-table-head"><div><b>Últimos trabajos documentados</b><span>Constancias recientes y estado del cobro.</span></div><Link href="/dashboard/constancias">Ver todas</Link></div>{certs.length===0?<p className="muted" style={{padding:24}}>Todavía no emitiste constancias.</p>:certs.slice(0,6).map(c=>{const paid=c.servicePayments.reduce((s,p)=>s+p.amountCents,0n);const balance=c.totalAmountCents===null?null:c.totalAmountCents>paid?c.totalAmountCents-paid:0n;return <Link className="table-row" key={c.id} href={"/dashboard/constancia/"+c.id}><span className="money">#{String(c.sequentialNumber).padStart(6,"0")}</span><div><b>{c.serviceTitle}</b><div className="muted">{c.client?.name||"Sin cliente"}{c.asset?" · "+c.asset.name:""}</div></div><span>{c.performedAt.toLocaleDateString("es-AR")}</span><span className={"pill "+(balance&&balance>0n?"pending":"paid")}>{balance&&balance>0n?"Saldo "+moneyCents(balance,c.currency):c.totalAmountCents===null?"Sin importe":"Pagado"}</span></Link>})}</section>
 </div></details>
 </>;
}