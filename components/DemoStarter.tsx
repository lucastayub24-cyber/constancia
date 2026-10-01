"use client";
import {useRouter} from "next/navigation";
import {useState} from "react";
import {ArrowRight,PlayCircle} from "lucide-react";

export function DemoStarter(){
 const router=useRouter();const[busy,setBusy]=useState(false);
 async function create(){
  setBusy(true);
  try{
   const r=await fetch("/api/demo/create",{method:"POST"});const j=await r.json();
   if(!r.ok)throw new Error(j.error||"No se pudo crear el ejemplo.");
   router.refresh();
  }catch(e){alert(e instanceof Error?e.message:"No se pudo crear el ejemplo.");}
  finally{setBusy(false)}
 }
 return <section className="demo-starter"><div><PlayCircle size={22}/><div><div className="eyebrow">PRIMERA VEZ EN CONSTANCIA</div><b>¿Querés ver una operación completa antes de cargar tus datos?</b><span>Te creamos un cliente, activo, presupuesto, orden, constancia, pago, contrato y próximo service conectados entre sí.</span></div></div><button type="button" className="btn btn-brand" onClick={create} disabled={busy}>{busy?"Creando ejemplo...":"Cargar ejemplo completo"}<ArrowRight size={14}/></button></section>
}