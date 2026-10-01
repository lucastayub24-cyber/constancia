"use client";
import Link from "next/link";
import {usePathname,useRouter} from "next/navigation";
import {Brand} from "@/components/Brand";
import {OrgSwitcher} from "@/components/OrgSwitcher";
import {InstallAppButton} from "@/components/InstallAppButton";
import {clearOfflineAppData} from "@/lib/offlineQueue";
import {CreditCard,FilePlus2,Files,LayoutDashboard,LogOut,Settings,ShieldCheck,Users,UserPlus,HelpCircle,PackageSearch,ClipboardList,CalendarDays,PanelsTopLeft,FileText,Repeat2,WalletCards,BarChart3} from "lucide-react";

export function DashboardShell({children,isAdmin,currentOrganizationId,organizations}:{children:React.ReactNode;isAdmin:boolean;currentOrganizationId:string;organizations:{id:string;name:string}[]}){
 const p=usePathname();const r=useRouter();
 const items=[["/dashboard","Resumen",LayoutDashboard],["/dashboard/nueva","Nueva constancia",FilePlus2],["/dashboard/constancias","Constancias",Files],["/dashboard/clientes","Clientes",Users],["/dashboard/activos","Activos",PackageSearch],["/dashboard/ordenes","Órdenes",ClipboardList],["/dashboard/agenda","Agenda",CalendarDays],["/dashboard/presupuestos","Presupuestos",FileText],["/dashboard/contratos","Contratos",Repeat2],["/dashboard/caja","Caja",WalletCards],["/dashboard/reportes","Reportes",BarChart3],["/dashboard/plantillas","Plantillas",PanelsTopLeft],["/dashboard/equipo","Equipo",UserPlus],["/dashboard/facturacion","Facturación",CreditCard],["/dashboard/configuracion","Configuración",Settings],["/ayuda","Ayuda",HelpCircle]] as const;
 async function logout(){await clearOfflineAppData().catch(()=>undefined);await fetch("/api/auth/logout",{method:"POST"});r.push("/");r.refresh()}
 return <div className="dash"><aside className="side"><Brand inverted/><OrgSwitcher currentId={currentOrganizationId} organizations={organizations}/><InstallAppButton/><nav className="sidenav">{items.map(([href,label,Icon])=><Link key={href} href={href} style={p===href||p.startsWith(href+"/")?{background:"#26342b",color:"#fff"}:undefined}><Icon size={16}/>{label}</Link>)}{isAdmin&&<Link href="/admin"><ShieldCheck size={16}/>Administración</Link>}<button onClick={logout} className="btn" style={{background:"transparent",justifyContent:"flex-start"}}><LogOut size={16}/>Salir</button></nav></aside><main className="dashmain">{children}</main></div>
}