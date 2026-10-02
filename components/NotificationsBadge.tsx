"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
import {Bell} from "lucide-react";
export function NotificationsBadge(){
 const[count,setCount]=useState(0);
 useEffect(()=>{let active=true;const load=()=>fetch("/api/notifications",{cache:"no-store"}).then(r=>r.json()).then(j=>active&&setCount(j.count||0)).catch(()=>undefined);load();const id=setInterval(load,20000);const on=()=>load();window.addEventListener("focus",on);return()=>{active=false;clearInterval(id);window.removeEventListener("focus",on)}},[]);
 return <Link className="notify-button" href="/dashboard/notificaciones" aria-label="Notificaciones"><Bell size={16}/>{count>0&&<span>{count>99?"99+":count}</span>}</Link>
}