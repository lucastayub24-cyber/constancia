import Link from "next/link";
import {redirect} from "next/navigation";
import {currentUser} from "@/lib/auth";
import {db} from "@/lib/db";
import {AdminSupportInbox} from "@/components/AdminSupportInbox";

export default async function AdminSupportPage(){
 const user=await currentUser();if(!user)redirect("/login");if(user.role!=="ADMIN")redirect("/dashboard");
 const threads=await db.supportThread.findMany({orderBy:[{status:"asc"},{lastMessageAt:"desc"}],take:200,include:{organization:{select:{name:true}},messages:{orderBy:{createdAt:"asc"},take:150}}});
 return <main className="admin-support-page"><div className="container"><header className="page-head"><div><Link href="/dashboard" className="muted">← Volver al dashboard</Link><div className="eyebrow" style={{marginTop:12}}>CENTRO DE SOPORTE</div><h1>Consultas de usuarios.</h1><p>Respondé mensajes de la web y del chat de Constancia desde un solo lugar.</p></div><Link className="btn btn-light" href="/admin">Administración general</Link></header><AdminSupportInbox threads={threads.map(t=>({id:t.id,name:t.name,email:t.email,subject:t.subject,status:t.status,lastMessageAt:t.lastMessageAt.toISOString(),organization:t.organization,messages:t.messages.map(m=>({id:m.id,sender:m.sender,body:m.body,createdAt:m.createdAt.toISOString()}))}))}/></div></main>
}