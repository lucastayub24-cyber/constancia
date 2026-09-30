"use client";
import {useEffect,useState} from "react";
import {Download,CheckCircle2} from "lucide-react";

type InstallPromptEvent=Event & {prompt:()=>Promise<void>;userChoice:Promise<{outcome:"accepted"|"dismissed"}>};

export function InstallAppButton(){
  const[prompt,setPrompt]=useState<InstallPromptEvent|null>(null);
  const[installed,setInstalled]=useState(false);
  const[isIos,setIsIos]=useState(false);

  useEffect(()=>{
    const standalone=window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & {standalone?:boolean}).standalone===true;
    setInstalled(standalone);
    setIsIos(/iphone|ipad|ipod/i.test(navigator.userAgent));
    const handler=(event:Event)=>{event.preventDefault();setPrompt(event as InstallPromptEvent)};
    const done=()=>{setInstalled(true);setPrompt(null)};
    window.addEventListener("beforeinstallprompt",handler);
    window.addEventListener("appinstalled",done);
    return()=>{window.removeEventListener("beforeinstallprompt",handler);window.removeEventListener("appinstalled",done)};
  },[]);

  if(installed)return <span className="app-installed"><CheckCircle2 size={15}/> App instalada</span>;

  async function install(){
    if(prompt){
      await prompt.prompt();
      const choice=await prompt.userChoice;
      if(choice.outcome==="accepted")setPrompt(null);
      return;
    }
    if(isIos)alert("En iPhone/iPad: tocá Compartir en Safari y elegí “Agregar a pantalla de inicio”.");
    else alert("Abrí el menú del navegador y elegí “Instalar aplicación” o “Agregar a pantalla de inicio”.");
  }

  return <button type="button" className="install-app-button" onClick={install}><Download size={15}/> Instalar app</button>;
}
