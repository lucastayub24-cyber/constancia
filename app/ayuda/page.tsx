import Link from "next/link";import {ArrowLeft,ArrowRight,Headphones} from "lucide-react";
const items=[
 ["¿Por dónde empiezo?","Creá un cliente y después un trabajo. No hace falta configurar equipos, plantillas, contratos ni reportes para empezar."],
 ["¿Tengo que completar todos los campos?","No. En Constancia 3.0 los datos avanzados son opcionales y aparecen solo cuando los abrís."],
 ["¿Cómo documento un trabajo?","Abrí Nueva constancia. Son cuatro pasos: trabajo, fotos, cobro y cierre. Solo el primer paso es obligatorio."],
 ["¿Puedo cobrar desde la constancia?","Sí. Podés registrar efectivo o transferencia, o conectar tu Mercado Pago para que el cliente pague desde la constancia pública."],
 ["¿Qué es un equipo o activo?","Es una máquina, vehículo o instalación a la que querés llevarle historial propio. Si no necesitás eso, no lo cargues."],
 ["¿Qué son los trabajos?","Es lo que antes se mostraba como órdenes de trabajo: qué hay que hacer, para qué cliente, cuándo y quién lo hace."],
 ["¿Se puede usar desde el celular?","Sí. El panel es responsive y también se puede instalar como app. El técnico puede trabajar desde el teléfono."],
 ["¿Puedo pedir ayuda?","Sí. Si ya tenés cuenta, usá el botón Soporte abajo a la derecha. Si todavía no entrás, podés dejarnos un mensaje desde la página de soporte."]
];
export default function Help(){return <main className="legal-page help-v3"><Link href="/" className="support-back"><ArrowLeft size={13}/>Volver</Link><div className="eyebrow" style={{marginTop:25}}>AYUDA SIMPLE</div><h1>No hace falta aprender todo.</h1><p>Estas son las dudas más comunes. Si no encontrás la tuya, escribinos.</p><div className="help-list-v3">{items.map(([q,a],i)=><details key={q} open={i===0}><summary>{q}<span>+</span></summary><p>{a}</p></details>)}</div><section className="help-support-v3"><Headphones size={22}/><div><b>¿Seguís trabado?</b><span>Contanos qué querés hacer con tus palabras.</span></div><Link className="btn btn-brand" href="/soporte">Ir a soporte <ArrowRight size={13}/></Link></section></main>}