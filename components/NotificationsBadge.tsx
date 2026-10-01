"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
import {Bell} from "lucide-react";
export function NotificationsBadge(){const[count,setCount]=useState(0);useEffect(()=>{fetch("/api/notifications").then(r=>r.json()).then(j=>setCount(j.count||0)).catch(()=>undefined)},[]);return <Link className="notify-button" href="/dashboard/notificaciones" aria-label="Notificaciones"><Bell size={16}/>{count>0&&<span>{count>99?"99+":count}</span>}</Link>}