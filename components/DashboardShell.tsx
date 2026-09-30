"use client";
import Link from "next/link";
import {usePathname,useRouter} from "next/navigation";
import {Brand} from "@/components/Brand";
import {CircleHelp,CreditCard,FilePlus2,Files,LayoutDashboard,LogOut,Settings,ShieldCheck,Users,UserPlus} from "lucide-react";

type Org={id:string;name:string;active:boolean};
export function DashboardShell({children,isAdmin,organizations}:{children:React.ReactNode;isAdmin:boolean;organizations:Org[]}){
 const p=usePathname();const r=useRouter();
 const items=[["/dashboard","Resumen",LayoutDashboard],["/dashboard/nueva","Nueva constancia",FilePlus2],["/dashboard/constancias","Constancias",Files],["/dashboard/clientes","Clientes",Users],["/dashboard/equipo","Equipo",UserPlus],["/dashboard/facturacion","Facturación",CreditCard],["/dashboard/configuracion","Configuración",Settings],["/dashboard/ayuda","Ayuda",CircleHelp]] as const;
 async function logout(){await fetch("/api/auth/logout",{method:"POST"});r.push("/");r.refresh()}
 async function switchOrg(organizationId:string){const x=await fetch("/api/organization/switch",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({organizationId})});if(x.ok){r.push("/dashboard");r.refresh()}}
 return <div className="dash"><aside className="side"><Brand/>{organizations.length>1&&<select aria-label="Empresa activa" className="select" style={{margin:"0 0 18px",background:"#223028",color:"#fff",borderColor:"#425247"}} value={organizations.find(o=>o.active)?.id||""} onChange={e=>switchOrg(e.target.value)}>{organizations.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}</select>}<nav className="sidenav">{items.map(([href,label,Icon])=><Link key={href} href={href} style={p===href||p.startsWith(href+"/")?{background:"#26342b",color:"#fff"}:undefined}><Icon size={16}/>{label}</Link>)}{isAdmin&&<Link href="/admin"><ShieldCheck size={16}/>Administración</Link>}<button onClick={logout} className="btn" style={{background:"transparent",justifyContent:"flex-start"}}><LogOut size={16}/>Salir</button></nav></aside><main className="dashmain">{children}</main></div>
}
