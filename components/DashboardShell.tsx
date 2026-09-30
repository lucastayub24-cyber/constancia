"use client";
import Link from "next/link";
import {usePathname,useRouter} from "next/navigation";
import {Brand} from "@/components/Brand";
import {OrgSwitcher} from "@/components/OrgSwitcher";
import {CreditCard,FilePlus2,Files,LayoutDashboard,LogOut,Settings,ShieldCheck,Users,UserPlus,HelpCircle} from "lucide-react";

export function DashboardShell({children,isAdmin,currentOrganizationId,organizations}:{children:React.ReactNode;isAdmin:boolean;currentOrganizationId:string;organizations:{id:string;name:string}[]}){
 const p=usePathname();const r=useRouter();
 const items=[["/dashboard","Resumen",LayoutDashboard],["/dashboard/nueva","Nueva constancia",FilePlus2],["/dashboard/constancias","Constancias",Files],["/dashboard/clientes","Clientes",Users],["/dashboard/equipo","Equipo",UserPlus],["/dashboard/facturacion","Facturación",CreditCard],["/dashboard/configuracion","Configuración",Settings],["/ayuda","Ayuda",HelpCircle]] as const;
 async function logout(){await fetch("/api/auth/logout",{method:"POST"});r.push("/");r.refresh()}
 return <div className="dash"><aside className="side"><Brand/><OrgSwitcher currentId={currentOrganizationId} organizations={organizations}/><nav className="sidenav">{items.map(([href,label,Icon])=><Link key={href} href={href} style={p===href||p.startsWith(href+"/")?{background:"#26342b",color:"#fff"}:undefined}><Icon size={16}/>{label}</Link>)}{isAdmin&&<Link href="/admin"><ShieldCheck size={16}/>Administración</Link>}<button onClick={logout} className="btn" style={{background:"transparent",justifyContent:"flex-start"}}><LogOut size={16}/>Salir</button></nav></aside><main className="dashmain">{children}</main></div>
}