import Link from "next/link";
import { Brand } from "./Brand";

export function Footer(){
  return <>
    <footer className="container footer">
      <div className="footer-brand"><Brand/><span>© {new Date().getFullYear()}</span></div>
      <nav aria-label="Información legal" style={{display:"flex",gap:14,flexWrap:"wrap"}}>
        <Link href="/legal/terminos">Términos</Link>
        <Link href="/legal/privacidad">Privacidad</Link>
        <Link href="/arrepentimiento">Arrepentimiento</Link>
        <Link href="/baja">Baja</Link>
      </nav>
    </footer>
    <div className="stickylegal" aria-label="Accesos legales rápidos">
      <Link href="/arrepentimiento">BOTÓN DE ARREPENTIMIENTO</Link>
      <Link href="/baja">BOTÓN DE BAJA DE SERVICIO</Link>
    </div>
  </>;
}
