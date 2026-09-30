const VERSION="v3";
const STATIC_CACHE="constancia-static-"+VERSION;
const PRIVATE_CACHE="constancia-private-"+VERSION;
const DB_NAME="constancia-offline";
const DB_VERSION=1;
const STORE="requests";

const SHELL=[
  "/",
  "/login",
  "/registro",
  "/offline",
  "/manifest.webmanifest",
  "/brand/constancia-logo.svg",
  "/brand/constancia-logo-on-dark.svg",
  "/brand/constancia-icon.svg",
  "/brand/constancia-app-icon.svg"
];

self.addEventListener("install",event=>{
  event.waitUntil(caches.open(STATIC_CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()));
});

self.addEventListener("activate",event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(key=>key.startsWith("constancia-")&&!key.endsWith(VERSION)).map(key=>caches.delete(key)));
    await self.clients.claim();
  })());
});

function openDb(){
  return new Promise((resolve,reject)=>{
    const req=indexedDB.open(DB_NAME,DB_VERSION);
    req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains(STORE))req.result.createObjectStore(STORE,{keyPath:"id"})};
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error);
  });
}

async function flushQueue(){
  const db=await openDb();
  const items=await new Promise((resolve,reject)=>{
    const tx=db.transaction(STORE,"readonly");
    const req=tx.objectStore(STORE).getAll();
    req.onsuccess=()=>resolve(req.result||[]);
    req.onerror=()=>reject(req.error);
  });

  for(const item of items.sort((a,b)=>a.createdAt-b.createdAt)){
    try{
      const response=await fetch(item.url,{method:item.method,headers:item.headers,body:item.body,credentials:"include"});
      if(!response.ok){
        if(response.status===401||response.status===403)break;
        continue;
      }
      await new Promise((resolve,reject)=>{
        const tx=db.transaction(STORE,"readwrite");
        tx.objectStore(STORE).delete(item.id);
        tx.oncomplete=resolve;
        tx.onerror=()=>reject(tx.error);
      });
    }catch{break}
  }
  db.close();
  const clients=await self.clients.matchAll({type:"window",includeUncontrolled:true});
  clients.forEach(client=>client.postMessage({type:"QUEUE_SYNCED"}));
}

self.addEventListener("sync",event=>{
  if(event.tag==="constancia-sync")event.waitUntil(flushQueue());
});

async function warmPrivateCache(){
  const cache=await caches.open(PRIVATE_CACHE);
  const urls=["/dashboard","/dashboard/nueva","/dashboard/clientes","/dashboard/constancias"];
  for(const url of urls){
    try{
      const response=await fetch(url,{credentials:"include",headers:{"Accept":"text/html"}});
      if(response.ok)await cache.put(url,response.clone());
    }catch{}
  }
}

self.addEventListener("message",event=>{
  if(event.data&&event.data.type==="FLUSH_QUEUE")event.waitUntil(flushQueue());
  if(event.data&&event.data.type==="CLEAR_PRIVATE_CACHE")event.waitUntil(caches.delete(PRIVATE_CACHE));
  if(event.data&&event.data.type==="WARM_PRIVATE_CACHE")event.waitUntil(warmPrivateCache());
});

self.addEventListener("fetch",event=>{
  const req=event.request;
  if(req.method!=="GET")return;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin)return;

  if(url.pathname.startsWith("/_next/static/")||url.pathname.startsWith("/brand/")){
    event.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(res=>{const copy=res.clone();caches.open(STATIC_CACHE).then(c=>c.put(req,copy));return res})));
    return;
  }

  if(req.mode==="navigate"){
    event.respondWith((async()=>{
      try{
        const response=await fetch(req);
        if(response.ok){
          const cache=await caches.open(url.pathname.startsWith("/dashboard")?PRIVATE_CACHE:STATIC_CACHE);
          await cache.put(req,response.clone());
        }
        return response;
      }catch{
        const hit=await caches.match(req,{ignoreVary:true})||await caches.match(url.pathname,{ignoreVary:true});
        return hit||await caches.match("/offline")||new Response("Sin conexión",{status:503,headers:{"Content-Type":"text/plain;charset=utf-8"}});
      }
    })());
  }
});
