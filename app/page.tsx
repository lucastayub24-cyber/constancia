import Link from "next/link";
import {ArrowRight,BarChart3,BriefcaseBusiness,CalendarDays,Camera,Check,ClipboardCheck,FileCheck2,FileText,HardHat,LogIn,MapPin,PackageCheck,QrCode,ReceiptText,RefreshCcw,ShieldCheck,Smartphone,UsersRound,Wrench} from "lucide-react";
import {PublicNav} from "@/components/PublicNav";
import {Footer} from "@/components/Footer";
import {PublicProcessShowcase} from "@/components/PublicProcessShowcase";
import {BeforeAfter} from "@/components/BeforeAfter";
import {VisualFaq} from "@/components/VisualFaq";
import {SimpleByDesign} from "@/components/SimpleByDesign";
import {SuccessStories} from "@/components/SuccessStories";
import {money} from "@/lib/utils";
import {PLAN_INFO} from "@/lib/plans";

const modules=[
 {i:UsersRound,t:"Clientes y portal",d:"Centralizá datos, equipos, trabajos, constancias y acceso privado para cada cliente."},
 {i:PackageCheck,t:"Equipos y activos",d:"ID interno, marca, modelo, serie, ubicación, garantía, QR físico e historial por equipo."},
 {i:ClipboardCheck,t:"Órdenes de trabajo",d:"Programá, asigná técnicos, definí prioridades y seguí cada trabajo hasta completarlo."},
 {i:CalendarDays,t:"Agenda operativa",d:"Próximos trabajos, services y contratos en una misma vista para ordenar el día a día."},
 {i:FileText,t:"Presupuestos",d:"Armá ítems y precios, compartí un link y convertí presupuestos aprobados en órdenes."},
 {i:RefreshCcw,t:"Contratos y abonos",d:"Registrá frecuencia, próxima visita, importe mensual y automatizá la siguiente orden."},
 {i:HardHat,t:"Ejecución en campo",d:"Checklist, GPS, horarios, notas técnicas y evidencia Antes / Durante / Después."},
 {i:FileCheck2,t:"Constancia verificable",d:"Firma, documento, IP, fotos, PDF, QR, garantía, próximo service y trazabilidad."},
 {i:ReceiptText,t:"Caja y cobros",d:"Pagos parciales, Mercado Pago, recibos, saldos y cuenta corriente por cliente."},
 {i:BarChart3,t:"Reportes",d:"Facturado, cobrado, deuda, materiales, margen, clientes principales y carga de trabajo."},
 {i:Smartphone,t:"App instalable",d:"Usala desde el celular como una app y mantené la operación disponible en campo."},
 {i:ShieldCheck,t:"Historial confiable",d:"Cada servicio queda relacionado con cliente, activo, técnico, evidencia y cobro."}
];

const flow=["Presupuesto","Aprobación","Orden","Agenda","Técnico","Checklist + GPS","Fotos","Firma","Constancia","Cobro","Próximo service"];

const faqs=[
 {q:"¿Qué veo apenas creo mi cuenta?",a:"No entrás a un sistema vacío. Constancia crea un ejemplo completo para que recorras el flujo antes de cargar información real.",steps:["Cliente demo","Activo demo con QR","Presupuesto aprobado","Orden completada","Constancia con firma","Pago parcial","Contrato y próximo service"]},
 {q:"¿Cómo creo mi primer cliente y equipo?",a:"Desde Clientes cargás los datos básicos. Después entrás a Activos, elegís el cliente y registrás el equipo con marca, modelo, serie y ubicación.",steps:["Clientes → Nuevo cliente","Activos → Nuevo activo","Vincular cliente","Completar identificación","Usar QR e historial"]},
 {q:"¿Cómo pasa un presupuesto a trabajo?",a:"Armás el presupuesto con ítems y precios, lo compartís y, cuando se aprueba, usás esa información para organizar la orden de trabajo.",steps:["Crear presupuesto","Compartir link","Aprobación","Crear/programar orden","Asignar técnico"]},
 {q:"¿Cómo trabaja un técnico desde el celular?",a:"Abre la orden asignada, inicia la ejecución y Constancia registra el contexto del trabajo antes de permitir el cierre.",steps:["Abrir OT","Iniciar + GPS","Completar checklist","Fotos Antes / Durante / Después","Notas técnicas","Finalizar + GPS"]},
 {q:"¿El checklist puede ser obligatorio?",a:"Sí. Si la plantilla tiene checklist, la orden no se puede cerrar desde el flujo de campo hasta completar los puntos requeridos.",steps:["Plantilla con checklist","Técnico marca tareas","Constancia bloquea cierre incompleto","Finaliza cuando todo está validado"]},
 {q:"¿Cómo se firma y verifica una constancia?",a:"Al cerrar el trabajo se registra la conformidad del cliente. La firma puede quedar acompañada por documento, fecha, IP, dispositivo, fotos, QR y PDF.",steps:["Finalizar ejecución","Emitir constancia","Firma + documento","QR verificable","PDF y evidencia"]},
 {q:"¿Cómo cobro un trabajo?",a:"Podés registrar pagos manuales o generar un link de Mercado Pago por el saldo. Cuando MP acredita, el pago se concilia automáticamente.",steps:["Definir importe","Registrar pago o crear link MP","Actualizar saldo","Emitir recibo","Ver cuenta corriente"]},
 {q:"¿Cómo programo el próximo service?",a:"Desde la constancia podés definir la próxima fecha. También podés crear contratos recurrentes para que Constancia lleve la visita a agenda y genere la siguiente OT automáticamente.",steps:["Próximo service","Contrato recurrente","Agenda","Orden automática","Nueva ejecución"]},
 {q:"¿El cliente tiene acceso a su información?",a:"Sí. El portal del cliente reúne sus activos, historial y constancias verificables mediante un acceso privado."},
 {q:"¿Se puede instalar como app?",a:"Sí. Constancia está preparada como PWA instalable para trabajar desde celular o computadora sin depender de una app pesada."},
 {q:"¿Para qué rubros sirve?",a:"Mantenimiento, climatización, electricidad, talleres, instalaciones, limpieza técnica, fumigación, servicios industriales, agro y cualquier operación que necesite documentar trabajos."},
 {q:"¿Tengo que cargar una tarjeta para probarla?",a:"No. Podés empezar gratis. Además, la primera cuenta ya viene con datos de ejemplo y los podés borrar desde el dashboard cuando quieras."}
];

export default function Home(){return <><a className="skip-link" href="#contenido">Saltar al contenido</a><PublicNav/><main id="contenido">
<section className="hero-v4-shell"><div className="container hero hero-v4">
 <div className="hero-copy hero-copy-v4">
  <div className="hero-kicker-v4"><span>CONSTANCIA 3.0</span><i/> Gestión simple para empresas de servicios</div>
  <h1>Todo tu trabajo.<br/><em>En un solo lugar.</em></h1>
  <p className="lead">Clientes, trabajos, fotos, constancias, cobros y próximos services conectados de punta a punta. Sin planillas eternas, sin perder información y sin tener que aprender un sistema complicado.</p>
  <div className="hero-actions hero-actions-v4"><Link href="/registro" className="btn btn-brand hero-primary-v4">Probar gratis <ArrowRight size={15}/></Link><Link href="/login" className="btn hero-login-v4"><LogIn size={14}/> Ingresar</Link><Link href="/#como-funciona" className="hero-tour-link-v4">Ver cómo funciona <ArrowRight size={13}/></Link></div>
  <div className="hero-proof hero-proof-v4"><span><Check size={13}/> Sin tarjeta</span><span><Check size={13}/> Demo lista al entrar</span><span><Smartphone size={13}/> Funciona como app</span><span><QrCode size={13}/> QR verificable</span></div>
 </div>

 <div className="hero-stage-v4">
  <div className="hero-glow-v4"/>
  <div className="hero-float-card hero-float-top"><span>HOY</span><b>5 trabajos</b><small>2 ya terminados</small></div>
  <div className="product-window product-window-v4">
   <div className="window-top"><span/><span/><span/><b>Constancia · Inicio</b><em>En línea</em></div>
   <div className="mini-stats mini-stats-v4"><div><small>TRABAJOS ABIERTOS</small><strong>12</strong><span>Todo bajo control</span></div><div><small>HOY</small><strong>5</strong><span>Agenda del día</span></div><div><small>COBRADO</small><strong>$1.24M</strong><span>Este mes</span></div></div>
   <div className="job-preview job-preview-v4">
    <div className="job-head"><div><small>OT-00142 · EN CURSO</small><b>Mantenimiento preventivo</b></div><span className="pill wo-in_progress">TRABAJANDO</span></div>
    <div className="job-meta"><span><UsersRound size={13}/> Metalúrgica Norte</span><span><Wrench size={13}/> Compresor Atlas</span><span><MapPin size={13}/> Ubicación registrada</span></div>
    <div className="progress-label"><span>Trabajo documentado</span><b>80%</b></div><div className="progress-track"><i/></div>
    <div className="evidence evidence-v4"><div><Camera size={17}/><span>ANTES</span><b>3 fotos</b></div><div><Camera size={17}/><span>DURANTE</span><b>4 fotos</b></div><div><Camera size={17}/><span>DESPUÉS</span><b>2 fotos</b></div></div>
   </div>
   <div className="window-foot window-foot-v4"><span>Cliente → Trabajo → Evidencia → Constancia → Cobro</span><span className="live-dot">Sincronizado</span></div>
  </div>
  <div className="hero-float-card hero-float-payment"><ReceiptText size={16}/><div><span>PAGO ACREDITADO</span><b>$95.000</b><small>Saldo actualizado automáticamente</small></div></div>
  <div className="hero-float-card hero-float-service"><RefreshCcw size={16}/><div><span>PRÓXIMO SERVICE</span><b>18 NOV</b><small>Recordatorio programado</small></div></div>
 </div>
</div></section>

<section className="public-value-strip-v4"><div className="container">
 <div><FileCheck2 size={18}/><span>Terminás el trabajo</span><b>Queda documentado</b></div>
 <div><ReceiptText size={18}/><span>El cliente paga</span><b>El saldo se actualiza</b></div>
 <div><RefreshCcw size={18}/><span>Definís próximo service</span><b>Constancia te lo recuerda</b></div>
 <div><Smartphone size={18}/><span>Desde el celular</span><b>Como una app</b></div>
</div></section>

<div className="container trust trust-v4"><div><b>Hecho para trabajo real.</b><span>Service técnico · climatización · mantenimiento industrial · talleres · instalaciones · agro · limpieza técnica · trabajo en campo.</span></div><Link href="/registro">Crear cuenta gratis <ArrowRight size={12}/></Link></div>

<section id="como-funciona" className="section section-white"><div className="container"><div className="section-intro"><div><div className="eyebrow">DEL PRIMER CONTACTO AL PRÓXIMO SERVICE</div><h2>Todo conectado.</h2></div><p>Lo que antes vivía separado entre WhatsApp, planillas, PDFs, fotos y memoria del equipo, ahora sigue un mismo recorrido.</p></div><div className="flow">{flow.map((x,i)=><div className="flow-step" key={x}><span>{String(i+1).padStart(2,"0")}</span><b>{x}</b>{i<flow.length-1&&<ArrowRight size={14}/>}</div>)}</div></div></section>

<PublicProcessShowcase/>

<BeforeAfter/>

<SuccessStories/>

<SimpleByDesign/>

<section className="section demo-promise-section"><div className="container demo-promise"><div className="demo-promise-copy"><div className="eyebrow">NO ARRANCÁS CON UNA PANTALLA VACÍA</div><h2>Tu primera cuenta ya viene con una operación de ejemplo.</h2><p>Entrás y ya tenés algo para tocar. Un caso completo, conectado de punta a punta, para entender el producto sin leer un manual.</p><div className="demo-object-list">{["Cliente","Activo + QR","Presupuesto","Orden","Constancia","Pago","Contrato","Próximo service"].map(x=><span key={x}><Check size={12}/>{x}</span>)}</div><div className="hero-actions"><Link href="/registro" className="btn btn-brand">Crear mi cuenta demo <ArrowRight size={14}/></Link><Link href="/login" className="btn btn-light">Ya tengo cuenta</Link></div></div><div className="demo-dashboard-preview"><div className="demo-preview-top"><span>PRIMEROS PASOS</span><b>Demo lista</b></div>{[["01","Cliente","Metalúrgica Norte"],["02","Activo","Compresor Atlas"],["03","Orden","Mantenimiento preventivo"],["04","Constancia","#000001"],["05","Cobro","$90.000 / $185.000"]].map(([n,t,d])=><div className="demo-preview-row" key={n}><span>{n}</span><div><b>{t}</b><small>{d}</small></div><ArrowRight size={12}/></div>)}<div className="demo-preview-foot">Podés borrar todos los ejemplos desde el dashboard.</div></div></div></section>

<section id="funciones" className="section"><div className="container"><div className="section-intro"><div><div className="eyebrow">CONSTANCIA 3.0</div><h2>Más que un comprobante.</h2></div><p>Un sistema operativo para empresas que venden, programan, ejecutan, cobran y vuelven a vender servicios.</p></div><div className="feature-grid">{modules.map(({i:I,t,d})=><article className="feature-card" key={t}><div className="iconbox"><I size={20}/></div><h3>{t}</h3><p>{d}</p></article>)}</div></div></section>

<section className="section dark-section"><div className="container"><div className="section-intro"><div><div className="eyebrow">PARA EL TRABAJO REAL</div><h2>El técnico documenta. La empresa controla.</h2></div><p>La evidencia nace en el lugar del trabajo y queda asociada a la orden, no perdida en el teléfono de alguien.</p></div><div className="role-grid"><article><HardHat size={24}/><h3>Técnico</h3><p>Orden asignada, checklist, GPS, fotos por etapa, notas, horarios y cierre del trabajo.</p></article><article><BriefcaseBusiness size={24}/><h3>Administración</h3><p>Agenda, presupuestos, contratos, materiales, cobros, saldos, activos, cuentas corrientes y reportes.</p></article><article><UsersRound size={24}/><h3>Cliente</h3><p>Presupuesto para aprobar, portal privado, historial, firma y constancias profesionales verificables.</p></article></div></div></section>

<section className="section section-white"><div className="container split-story"><div><div className="eyebrow">TRAZABILIDAD</div><h2>Un equipo deja de ser “ese equipo”.</h2><p className="lead-small">Cada activo tiene identidad e historial. Sabés qué se hizo, cuándo, quién lo hizo, qué materiales se usaron y cuál es el próximo paso.</p><ul className="clean-list"><li><Check/> ID interno y QR individual</li><li><Check/> Marca, modelo, serie y ubicación</li><li><Check/> Instalación y garantía</li><li><Check/> Historial de órdenes y constancias</li><li><Check/> Contratos y próximos mantenimientos</li></ul></div><div className="asset-card"><div className="asset-code">A-00027</div><div className="asset-qr">QR</div><small>EQUIPO</small><h3>Compresor principal</h3><dl><div><dt>Marca / modelo</dt><dd>Atlas · GA 15</dd></div><div><dt>Serie</dt><dd>AC-845921</dd></div><div><dt>Ubicación</dt><dd>Planta 1</dd></div><div><dt>Próximo service</dt><dd>18/11/2026</dd></div></dl><span className="status">ACTIVO · HISTORIAL AL DÍA</span></div></div></section>

<section id="precios" className="section"><div className="container"><div className="section-intro"><div><div className="eyebrow">PRECIOS</div><h2>Empezá chico. Operá en serio.</h2></div><p>Probalo gratis con una cuenta ya preparada y escalá cuando el volumen de tu operación lo necesite.</p></div><div className="pricing pricing-v2">{Object.entries(PLAN_INFO).map(([key,p])=><div className={`card pricecard ${key==="PRO"?"popular":""}`} key={key}>{key==="PRO"&&<span className="badge">MÁS ELEGIDO</span>}<b>{p.name}</b><div className="price">{p.monthly?money(p.monthly):"$0"}</div><div className="muted price-sub">por mes</div><ul className="list"><li>✓ {p.certificateLimit} constancias/mes</li><li>✓ QR + PDF verificable</li><li>✓ Clientes, activos y órdenes</li><li>✓ Presupuestos y operación</li><li>{p.reminders?"✓":"—"} Recordatorios</li><li>{p.team?"✓":"—"} Trabajo en equipo</li></ul><Link href="/registro" className={`btn ${key==="PRO"?"btn-brand":"btn-light"}`}>Probar gratis</Link></div>)}</div></div></section>

<VisualFaq/>

<section id="faq" className="section section-white"><div className="container faq-wrap faq-wrap-v2"><div className="faq-title"><div className="eyebrow">AYUDA ANTES DE EMPEZAR</div><h2>Te mostramos cómo se hace.</h2><p>Cada respuesta explica el proceso concreto. Si querés verlo visualmente, el recorrido de arriba reproduce las pantallas clave del sistema.</p><Link href="/#guia" className="text-link">Ver guía visual <ArrowRight size={13}/></Link><Link href="/soporte" className="text-link">Preguntar a soporte <ArrowRight size={13}/></Link></div><div className="faq-list faq-list-v2">{faqs.map((item,i)=><details key={item.q} open={i===0}><summary>{item.q}<span>+</span></summary><div className="faq-answer"><p>{item.a}</p>{item.steps&&<div className="faq-steps">{item.steps.map((s,n)=><div key={s}><span>{n+1}</span><b>{s}</b></div>)}</div>}</div></details>)}</div></div></section>

<section className="section final-cta final-cta-v2"><div className="container"><div><div className="eyebrow">ENTRÁ Y PROBALO CON DATOS REALES DE EJEMPLO</div><h2>Entrás, elegís qué querés hacer y Constancia te muestra el próximo paso.</h2></div><div className="final-actions"><Link href="/registro" className="btn btn-brand">Probar gratis <ArrowRight size={15}/></Link><Link href="/login" className="btn btn-light"><LogIn size={14}/> Ingresar</Link></div></div></section>
</main><Footer/></>}