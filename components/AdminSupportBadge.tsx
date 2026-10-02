"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
import {Headphones} from "lucide-react";
export function AdminSupportBadge(){const[count,setCount]=useState(0);useEffect(()=>{let on=true;const load=()=>fetch("/api/admin/support/count",{cache:"no-store"}).then(r=>r.json()).then(j=>on&&setCount(j.count||0)).catch(()=>undefined);load();const id=setInterval(load,10000);return()=>{on=false;clearInterval(id)}},[]);return <Link className="admin-support-badge" href="/admin/soporte" aria-label="Soporte"><Headphones size={16}/><span>Soporte</span>{count>0&&<b>{count>99?"99+":count}</b>}</Link>}