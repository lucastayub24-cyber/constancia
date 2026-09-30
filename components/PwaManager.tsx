"use client";
import {useEffect,useState} from "react";
import {usePathname} from "next/navigation";
import {flushOfflineQueue,getOfflineQueueCount} from "@/lib/offlineQueue";

export function PwaManager(){
  const pathname=usePathname();
  const[online,setOnline]=useState(true);
  const[queued,setQueued]=useState(0);
  const[synced,setSynced]=useState(false);

  useEffect(()=>{
    setOnline(navigator.onLine);
    if("serviceWorker" in navigator){
      navigator.serviceWorker.register("/sw.js",{scope:"/"}).catch(()=>undefined);
    }
  },[]);

  useEffect(()=>{
    let active=true;
    const refresh=()=>getOfflineQueueCount().then(n=>active&&setQueued(n)).catch(()=>undefined);
    const sync=async()=>{
      setOnline(true);
      const n=await flushOfflineQueue().catch(()=>0);
      if(n>0){setSynced(true);setTimeout(()=>setSynced(false),3500)}
      refresh();
    };
    const offline=()=>setOnline(false);
    window.addEventListener("online",sync);
    window.addEventListener("offline",offline);
    window.addEventListener("constancia-queue-changed",refresh as EventListener);
    navigator.serviceWorker?.addEventListener("message",refresh);
    refresh();
    if(navigator.onLine)sync();

    if(pathname.startsWith("/dashboard")&&navigator.onLine){
      ["/dashboard","/dashboard/nueva","/dashboard/clientes","/dashboard/constancias"]
        .forEach(url=>fetch(url,{credentials:"include",headers:{"X-Constancia-Warm":"1"}}).catch(()=>undefined));
    }
    return()=>{
      active=false;
      window.removeEventListener("online",sync);
      window.removeEventListener("offline",offline);
      window.removeEventListener("constancia-queue-changed",refresh as EventListener);
      navigator.serviceWorker?.removeEventListener("message",refresh);
    };
  },[pathname]);

  if(online&&queued===0&&!synced)return null;
  const text=!online
    ? "Sin conexión · "+(queued?queued+" pendiente"+(queued===1?"":"s"):"podés seguir trabajando")
    : synced
      ? "Datos sincronizados"
      : queued+" pendiente"+(queued===1?"":"s")+" · sincronizando…";
  return <div className={"offline-banner "+(online?"online":"offline")}>{text}</div>;
}
