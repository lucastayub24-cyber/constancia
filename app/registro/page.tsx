import Link from "next/link";
import {redirect} from "next/navigation";
import {Brand} from "@/components/Brand";
import {RegisterForm} from "@/components/AuthForms";
import {currentUser} from "@/lib/auth";

const safe=(value?:string)=>value&&value.startsWith("/")&&!value.startsWith("//")?value:"/dashboard";
const googleMessage=(value?:string)=>{
 if(!value)return "";
 if(value==="not_configured")return "Google todavía no está configurado en Constancia.";
 if(value==="denied")return "Se canceló el registro con Google.";
 if(value==="invalid_state")return "La autorización de Google venció. Probá nuevamente.";
 if(value==="account_conflict")return "Ese email ya está vinculado a otra cuenta de Google.";
 if(value==="link_required")return "Ese email ya tiene una cuenta. Ingresá con contraseña y después podrás usar Google.";
 return "No se pudo completar el registro con Google.";
};

export default async function RegisterPage({searchParams}:{searchParams:Promise<{next?:string;google?:string}>}){
 const q=await searchParams;const next=safe(q.next);if(await currentUser())redirect(next);
 const message=googleMessage(q.google);
 return <main className="auth-page"><section className="auth-card"><Brand/><h1>Tu primer trabajo documentado empieza acá.</h1><p className="muted">5 constancias por mes gratis. Sin tarjeta.</p>{message&&<div className="error" style={{marginBottom:12}}>{message}</div>}<RegisterForm next={next}/><p className="muted" style={{fontSize:11,marginTop:18}}>¿Ya tenés cuenta? <Link href={"/login?next="+encodeURIComponent(next)} style={{color:"var(--green)",fontWeight:700}}>Ingresar</Link></p></section></main>
}