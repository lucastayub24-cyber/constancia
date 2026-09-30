"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

async function api(path:string, body:unknown){
  const res=await fetch(path,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
  const data=await res.json().catch(()=>({}));
  if(!res.ok) throw new Error(data.error||"Ocurrió un error");
  return data;
}

export function LoginForm(){
  const router=useRouter();
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);
  async function submit(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();setBusy(true);setError("");
    const f=new FormData(e.currentTarget);
    try{await api("/api/auth/login",{email:f.get("email"),password:f.get("password")});router.push("/dashboard");router.refresh()}
    catch(err){setError(err instanceof Error?err.message:"No se pudo ingresar")}
    finally{setBusy(false)}
  }
  return <form className="form" onSubmit={submit}>
    {error&&<div className="error">{error}</div>}
    <div className="field"><label>Email</label><input className="input" name="email" type="email" required autoComplete="email"/></div>
    <div className="field"><label>Contraseña</label><input className="input" name="password" type="password" required autoComplete="current-password"/></div>
    <button className="btn btn-brand" disabled={busy}>{busy?"Ingresando...":"Ingresar"}</button>
  </form>
}

export function RegisterForm(){
  const router=useRouter();
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);
  async function submit(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();setBusy(true);setError("");
    const f=new FormData(e.currentTarget);
    try{await api("/api/auth/register",{name:f.get("name"),organizationName:f.get("organizationName"),email:f.get("email"),password:f.get("password")});router.push("/dashboard");router.refresh()}
    catch(err){setError(err instanceof Error?err.message:"No se pudo crear la cuenta")}
    finally{setBusy(false)}
  }
  return <form className="form" onSubmit={submit}>
    {error&&<div className="error">{error}</div>}
    <div className="field"><label>Tu nombre</label><input className="input" name="name" required/></div>
    <div className="field"><label>Empresa o actividad</label><input className="input" name="organizationName" placeholder="Ej. Refrigeración Pérez" required/></div>
    <div className="field"><label>Email</label><input className="input" name="email" type="email" required autoComplete="email"/></div>
    <div className="field"><label>Contraseña</label><input className="input" name="password" type="password" minLength={8} required autoComplete="new-password"/></div>
    <button className="btn btn-brand" disabled={busy}>{busy?"Creando...":"Crear cuenta gratis"}</button>
  </form>
}
