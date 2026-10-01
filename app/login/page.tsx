import Link from "next/link";
import {redirect} from "next/navigation";
import {Brand} from "@/components/Brand";
import {LoginForm} from "@/components/AuthForms";
import {currentUser} from "@/lib/auth";

const safe=(value?:string)=>value&&value.startsWith("/")&&!value.startsWith("//")?value:"/dashboard";
const googleMessage=(value?:string)=>{
 if(!value)return "";
 if(value==="not_configured")return "Google todavía no está configurado en Constancia.";
 if(value==="denied")return "Se canceló el ingreso con Google.";
 if(value==="invalid_state")return "La autorización de Google venció. Probá nuevamente.";
 if(value==="account_conflict")return "Esa cuenta ya está vinculada con otro usuario de Google.";
 if(value==="link_required")return "Por seguridad, ingresá una vez con email y contraseña antes de vincular esta cuenta de Google.";
 return "No se pudo completar el ingreso con Google.";
};

export default async function LoginPage({searchParams}:{searchParams:Promise<{next?:string;google?:string}>}){
 const q=await searchParams;const next=safe(q.next);if(await currentUser())redirect(next);
 const message=googleMessage(q.google);
 return <main className="auth-page"><section className="auth-card"><Brand/><h1>Volvé a tus constancias.</h1><p className="muted">Ingresá para continuar.</p>{message&&<div className="error" style={{marginBottom:12}}>{message}</div>}<LoginForm next={next}/><div style={{display:"flex",justifyContent:"space-between",gap:12,fontSize:11,marginTop:18}}><Link href={"/registro?next="+encodeURIComponent(next)} style={{color:"var(--green)",fontWeight:700}}>Crear cuenta</Link><Link href="/recuperar" className="muted">Olvidé mi contraseña</Link></div></section></main>
}