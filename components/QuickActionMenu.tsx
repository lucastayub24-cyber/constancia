"use client";
import Link from "next/link";
import {useEffect,useRef,useState} from "react";
import {ChevronDown,CircleDollarSign,ClipboardList,FileCheck2,FileText,Headphones,Plus,UserPlus,X} from "lucide-react";

const actions=[
 {href:"/dashboard/ordenes#nuevo",title:"Tengo un trabajo nuevo",text:"Creá la tarea y programala.",I:ClipboardList},
 {href:"/dashboard/clientes#nuevo",title:"Quiero agregar un cliente",text:"Con el nombre alcanza.",I:UserPlus},
 {href:"/dashboard/nueva",title:"Terminé un trabajo",text:"Emití la constancia paso a paso.",I:FileCheck2},
 {href:"/dashboard/cuentas",title:"Quiero cobrar",text:"Mirá saldos y registrá pagos.",I:CircleDollarSign},
 {href:"/dashboard/presupuestos#nuevo",title:"Quiero pasar un precio",text:"Armá un presupuesto simple.",I:FileText},
] as const;

export function QuickActionMenu(){
 const[open,setOpen]=useState(false);const ref=useRef<HTMLDivElement|null>(null);
 useEffect(()=>{const h=(e:MouseEvent)=>{if(ref.current&&!ref.current.contains(e.target as Node))setOpen(false)};document.addEventListener("mousedown",h);return()=>document.removeEventListener("mousedown",h)},[]);
 function support(){setOpen(false);window.dispatchEvent(new CustomEvent("constancia:support",{detail:{prefill:"Necesito ayuda para "}}))}
 return <div className="quick-action-menu" ref={ref}>
  <button type="button" className="topbar-new topbar-do" onClick={()=>setOpen(v=>!v)} aria-expanded={open}><Plus size={14}/>Quiero hacer...<ChevronDown size={13}/></button>
  {open&&<div className="quick-action-popover"><div className="quick-action-head"><div><span>¿QUÉ QUERÉS HACER?</span><b>Elegí una acción. Te llevamos directo.</b></div><button onClick={()=>setOpen(false)} aria-label="Cerrar"><X size={15}/></button></div>{actions.map(({href,title,text,I})=><Link href={href} key={href} onClick={()=>setOpen(false)}><span><I size={17}/></span><div><b>{title}</b><small>{text}</small></div></Link>)}<button className="quick-support-action" type="button" onClick={support}><span><Headphones size={17}/></span><div><b>No sé dónde está</b><small>Preguntale a soporte con tus palabras.</small></div></button></div>}
 </div>
}