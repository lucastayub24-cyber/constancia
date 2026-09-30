import Link from "next/link";
import {Brand} from "@/components/Brand";

export default function OfflinePage(){
  return <main className="auth-page">
    <section className="auth-card">
      <Brand/>
      <div className="eyebrow" style={{marginTop:24}}>MODO OFFLINE</div>
      <h1>Seguís trabajando.</h1>
      <p className="muted">No hay conexión en este momento. Las pantallas que ya usaste quedan disponibles y las nuevas constancias se guardan en el dispositivo para sincronizarse automáticamente cuando vuelva internet.</p>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        <Link className="btn btn-brand" href="/dashboard/nueva">Nueva constancia</Link>
        <Link className="btn btn-light" href="/dashboard">Panel</Link>
      </div>
    </section>
  </main>;
}
