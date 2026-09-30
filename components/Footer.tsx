import Link from "next/link";
import { Brand } from "./Brand";

export function Footer(){
  return <>
    <div className="container footer">
      <div className="footer-brand"><Brand/><span>© {new Date().getFullYear()}</span></div>
      <span style={{display:"flex",gap:14,flexWrap:"wrap"}}>
        <Link href="/legal/terminos">Términos</Link>
        <Link href="/legal/privacidad">Privacidad</Link>
        <Link href="/arrepentimiento">Arrepentimiento</Link>
        <Link href="/baja">Baja</Link>
      </span>
    </div>
    <div className="stickylegal">
      <Link href="/arrepentimiento">BOTÓN DE ARREPENTIMIENTO</Link>
      <Link href="/baja">BOTÓN DE BAJA DE SERVICIO</Link>
    </div>
  </>;
}
