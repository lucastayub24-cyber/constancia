"use client";
import {useState} from "react";

export function AccountTools(){
  const[password,setPassword]=useState("");
  const[confirmation,setConfirmation]=useState("");
  const[busy,setBusy]=useState(false);
  const[error,setError]=useState("");
  async function remove(){
    if(confirmation!=="ELIMINAR"){setError('Escribí "ELIMINAR" para confirmar.');return}
    if(!confirm("Esta acción elimina tu cuenta y las empresas donde seas el único propietario, junto con sus clientes, constancias y pagos. ¿Continuar?"))return;
    setBusy(true);setError("");
    const response=await fetch("/api/account/delete",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({password,confirmation})});
    const body=await response.json().catch(()=>({}));
    if(!response.ok){setError(body.error||"No se pudo eliminar");setBusy(false);return}
    location.href="/";
  }
  return <section className="panel" style={{marginTop:14}}>
    <h2>Cuenta y datos</h2>
    <p className="muted">Podés descargar una copia estructurada de los datos de tu cuenta y tus empresas.</p>
    <a className="btn btn-light" href="/api/account/export">Exportar mis datos</a>
    <div style={{borderTop:"1px solid var(--line)",marginTop:22,paddingTop:18}}>
      <b style={{color:"var(--danger)"}}>Eliminar cuenta</b>
      <p className="muted" style={{fontSize:11,lineHeight:1.5}}>Se cancelan suscripciones activas de las empresas donde seas el único propietario y se eliminan esas empresas con sus datos. Si una empresa tiene otro propietario, permanece activa sin tu acceso.</p>
      <div className="form-grid">
        <label className="field">Contraseña<input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password"/></label>
        <label className="field">Confirmación<input className="input" value={confirmation} onChange={e=>setConfirmation(e.target.value)} placeholder="ELIMINAR"/></label>
      </div>
      {error&&<div className="error" style={{marginTop:10}}>{error}</div>}
      <div className="actions"><button className="btn btn-danger" disabled={busy||!password} onClick={remove}>{busy?"Eliminando...":"Eliminar definitivamente"}</button></div>
    </div>
  </section>
}
