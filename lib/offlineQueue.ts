"use client";

const DB_NAME="constancia-offline";
const DB_VERSION=1;
const STORE="requests";

type QueuedRequest={
  id:string;
  url:string;
  method:string;
  headers:Record<string,string>;
  body:string;
  createdAt:number;
};

function openDb():Promise<IDBDatabase>{
  return new Promise((resolve,reject)=>{
    const request=indexedDB.open(DB_NAME,DB_VERSION);
    request.onupgradeneeded=()=>{
      const db=request.result;
      if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE,{keyPath:"id"});
    };
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>reject(request.error);
  });
}

export async function queueCertificate(body:unknown){
  const db=await openDb();
  const item:QueuedRequest={
    id:crypto.randomUUID(),
    url:"/api/certificates",
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(body),
    createdAt:Date.now(),
  };
  await new Promise<void>((resolve,reject)=>{
    const tx=db.transaction(STORE,"readwrite");
    tx.objectStore(STORE).put(item);
    tx.oncomplete=()=>resolve();
    tx.onerror=()=>reject(tx.error);
  });
  db.close();

  if("serviceWorker" in navigator){
    const reg=await navigator.serviceWorker.ready.catch(()=>null);
    if(reg){
      const syncReg=reg as ServiceWorkerRegistration & {sync?:{register:(tag:string)=>Promise<void>}};
      await syncReg.sync?.register("constancia-sync").catch(()=>undefined);
      reg.active?.postMessage({type:"FLUSH_QUEUE"});
    }
  }
  window.dispatchEvent(new CustomEvent("constancia-queue-changed"));
  return item.id;
}

export async function getOfflineQueueCount(){
  const db=await openDb();
  const count=await new Promise<number>((resolve,reject)=>{
    const tx=db.transaction(STORE,"readonly");
    const req=tx.objectStore(STORE).count();
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error);
  });
  db.close();
  return count;
}

export async function flushOfflineQueue(){
  if(!navigator.onLine)return 0;
  const db=await openDb();
  const items=await new Promise<QueuedRequest[]>((resolve,reject)=>{
    const tx=db.transaction(STORE,"readonly");
    const req=tx.objectStore(STORE).getAll();
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error);
  });

  let synced=0;
  for(const item of items.sort((a,b)=>a.createdAt-b.createdAt)){
    try{
      const response=await fetch(item.url,{
        method:item.method,
        headers:item.headers,
        body:item.body,
        credentials:"include",
      });
      if(!response.ok){
        if(response.status===401||response.status===403)break;
        continue;
      }
      await new Promise<void>((resolve,reject)=>{
        const tx=db.transaction(STORE,"readwrite");
        tx.objectStore(STORE).delete(item.id);
        tx.oncomplete=()=>resolve();
        tx.onerror=()=>reject(tx.error);
      });
      synced++;
    }catch{
      break;
    }
  }
  db.close();
  if(synced)window.dispatchEvent(new CustomEvent("constancia-queue-changed",{detail:{synced}}));
  return synced;
}

export async function clearOfflineAppData(){
  if("caches" in window){
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k.startsWith("constancia-")).map(k=>caches.delete(k)));
  }
  await new Promise<void>((resolve)=>{
    const req=indexedDB.deleteDatabase(DB_NAME);
    req.onsuccess=()=>resolve();
    req.onerror=()=>resolve();
    req.onblocked=()=>resolve();
  });
  navigator.serviceWorker?.controller?.postMessage({type:"CLEAR_PRIVATE_CACHE"});
}
