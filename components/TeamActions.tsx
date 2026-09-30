"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";

export function TeamActions({membershipId,currentRole,canManage,isSelf}:{membershipId:string;currentRole:"OWNER"|"ADMIN"|"MEMBER";canManage:boolean;isSelf:boolean}){
  const router=useRouter();
  const[busy,setBusy]=useState(false);
  const[error,setError]=useState("");
  async function change(role:string){
    setBusy(true);setError("");
    const response=await fetch("/api/team/members/"+membershipId,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({role})});
    const body=await response.json().catch(()=>({}));
    if(!response.ok)setError(body.error||"No se pudo actualizar");else router.refresh();
    setBusy(false);
  }
  async function remove(){
    if(!confirm("¿Quitar este usuario del equipo?"))return;
    setBusy(true);setError("");
    const response=await fetch("/api/team/members/"+membershipId,{method:"DELETE"});
    const body=await response.json().catch(()=>({}));
    if(!response.ok)setError(body.error||"No se pudo quitar");else router.refresh();
    setBusy(false);
  }
  if(!canManage||isSelf)return <span className="pill">{currentRole}</span>;
  return <div style={{display:"grid",gap:5}}>
    <select className="select" value={currentRole} disabled={busy} onChange={e=>change(e.target.value)}>
      <option value="MEMBER">Miembro</option><option value="ADMIN">Administrador</option><option value="OWNER">Propietario</option>
    </select>
    <button className="btn btn-light" disabled={busy} onClick={remove}>Quitar</button>
    {error&&<small style={{color:"var(--danger)",maxWidth:180}}>{error}</small>}
  </div>
}
