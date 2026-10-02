"use client";
import Link from "next/link";
import {usePathname,useRouter} from "next/navigation";
import {Brand} from "@/components/Brand";
import {OrgSwitcher} from "@/components/OrgSwitcher";
import {InstallAppButton} from "@/components/InstallAppButton";
import {GlobalSearch} from "@/components/GlobalSearch";
import {NotificationsBadge} from "@/components/NotificationsBadge";
import {QuickActionMenu} from "@/components/QuickActionMenu";
import {DashboardCoach} from "@/components/DashboardCoach";
import {clearOfflineAppData} from "@/lib/offlineQueue";
import {BarChart3,CalendarDays,ChevronDown,CircleDollarSign,ClipboardList,CreditCard,FileCheck2,FileText,Grid2X2,HelpCircle,Home,Landmark,LogOut,PackageSearch,PanelsTopLeft,Plus,Repeat2,Settings,ShieldCheck,UserPlus,Users} from "lucide-react";

export function DashboardShell({children,isAdmin,currentOrganizationId,organizations}:{children:React.ReactNode;isAdmin:boolean;currentOrganizationId:string;organizations:{id:string;name:string}[]}){
 const p=usePathname();const r=useRouter();
 const main=[
  ["/dashboard","Inicio",Home],
  ["/dashboard/ordenes","Trabajos",ClipboardList],
  ["/dashboard/clientes","Clientes",Users],
  ["/dashboard/caja","Cobros",CircleDollarSign],
  ["/dashboard/mas","Más",Grid2X2],
 ] as const;
 const tools=[
  ["/dashboard/constancias","Constancias",FileCheck2],
  ["/dashboard/activos","Equipos",PackageSearch],
  ["/dashboard/agenda","Agenda",CalendarDays],
  ["/dashboard/presupuestos","Presupuestos",FileText],
  ["/dashboard/contratos","Abonos y recurrencia",Repeat2],
  ["/dashboard/cuentas","Cuentas corrientes",Landmark],
  ["/dashboard/reportes","Reportes",BarChart3],
  ["/dashboard/plantillas","Plantillas",PanelsTopLeft],
  ["/dashboard/equipo","Mi equipo",UserPlus],
 ] as const;
 const account=[
  ["/dashboard/facturacion","Plan y facturación",CreditCard],
  ["/dashboard/configuracion","Configuración",Settings],
  ["/dashboard/guia","Cómo se usa",HelpCircle],
 ] as const;
 const active=(href:string)=>href==="/dashboard"?p===href:p===href||p.startsWith(href+"/");
 async function logout(){await clearOfflineAppData().catch(()=>undefined);await fetch("/api/auth/logout",{method:"POST"});r.push("/");r.refresh()}
 return <div className="dash dash-v3"><aside className="side side-v3">
   <div className="side-brand"><Brand inverted/></div>
   <OrgSwitcher currentId={currentOrganizationId} organizations={organizations}/>
   <Link className="side-new-work" href="/dashboard/ordenes#nuevo"><Plus size={16}/>Nuevo trabajo</Link>
   <nav className="sidenav sidenav-v3">{main.map(([href,label,Icon])=><Link key={href} href={href} className={active(href)?"active":""}><Icon size={17}/><span>{label}</span></Link>)}</nav>
   <details className="side-group" open={tools.some(([href])=>active(href))}><summary><span>Más herramientas</span><ChevronDown size={14}/></summary><nav>{tools.map(([href,label,Icon])=><Link key={href} href={href} className={active(href)?"active":""}><Icon size={15}/><span>{label}</span></Link>)}</nav></details>
   <details className="side-group" open={account.some(([href])=>active(href))}><summary><span>Cuenta y ayuda</span><ChevronDown size={14}/></summary><nav>{account.map(([href,label,Icon])=><Link key={href} href={href} className={active(href)?"active":""}><Icon size={15}/><span>{label}</span></Link>)}</nav></details>
   <div className="side-bottom"><InstallAppButton/>{isAdmin&&<Link href="/admin" className={active("/admin")?"active":""}><ShieldCheck size={15}/>Administración</Link>}<button onClick={logout}><LogOut size={15}/>Salir</button></div>
  </aside>

  <div className="mobile-dash-head"><Brand/><OrgSwitcher currentId={currentOrganizationId} organizations={organizations}/></div>

  <div className="dashworkspace">
   <div className="dash-topbar dash-topbar-v3"><div className="topbar-search"><GlobalSearch/></div><div className="topbar-actions"><QuickActionMenu/><NotificationsBadge/></div></div>
   <div className="dash-coach-wrap"><DashboardCoach/></div>
   <main className="dashmain dashmain-v3">{children}</main>
  </div>

  <nav className="mobile-dash-nav" aria-label="Navegación del panel">
   <Link href="/dashboard" className={active("/dashboard")?"active":""}><Home size={18}/><span>Inicio</span></Link>
   <Link href="/dashboard/ordenes" className={active("/dashboard/ordenes")?"active":""}><ClipboardList size={18}/><span>Trabajos</span></Link>
   <Link href="/dashboard/ordenes#nuevo" className="mobile-create"><Plus size={20}/><span>Nuevo</span></Link>
   <Link href="/dashboard/clientes" className={active("/dashboard/clientes")?"active":""}><Users size={18}/><span>Clientes</span></Link>
   <Link href="/dashboard/mas" className={active("/dashboard/mas")?"active":""}><Grid2X2 size={18}/><span>Más</span></Link>
  </nav>
 </div>
}