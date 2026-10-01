"use client";
import Link from "next/link";
import {useEffect,useRef,useState} from "react";
import {Search,X} from "lucide-react";
type Result={type:string;title:string;subtitle:string;href:string};
export function GlobalSearch(){
 const[q,setQ]=useState("");const[rows,setRows]=useState<Result[]>([]);const[open,setOpen]=useState(false);const[busy,setBusy]=useState(false);const box=useRef<HTMLDivElement>(null);
 useEffect(()=>{const fn=(e:MouseEvent)=>{if(box.current&&!box.current.contains(e.target as Node))setOpen(false)};document.addEventListener("mousedown",fn);return()=>document.removeEventListener("mousedown",fn)},[]);
 useEffect(()=>{if(q.trim().length<2){setRows([]);return}setBusy(true);const t=setTimeout(async()=>{try{const r=await fetch("/api/search?q="+encodeURIComponent(q));const j=await r.json();setRows(j.results||[]);setOpen(true)}finally{setBusy(false)}},220);return()=>clearTimeout(t)},[q]);
 return <div className="global-search" ref={box}><Search size={15}/><input value={q} onChange={e=>setQ(e.target.value)} onFocus={()=>q.length>=2&&setOpen(true)} placeholder="Buscar cliente, activo, OT, constancia..."/>{q&&<button aria-label="Limpiar búsqueda" onClick={()=>{setQ("");setRows([])}}><X size={14}/></button>}
 {open&&<div className="search-popover">{busy?<div className="search-empty">Buscando...</div>:rows.length===0?<div className="search-empty">No encontramos resultados.</div>:rows.map((x,i)=><Link href={x.href} key={i} onClick={()=>setOpen(false)}><span>{x.type}</span><div><b>{x.title}</b><small>{x.subtitle}</small></div></Link>)}</div>}</div>
}