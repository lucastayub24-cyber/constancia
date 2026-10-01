import {Camera,Check,ClipboardCheck,FileCheck2,MapPin,PackageCheck,ReceiptText,UsersRound} from "lucide-react";

const cards=[
 {I:UsersRound,k:"CLIENTE",t:"1. Cargás el cliente",d:"Nombre, contacto, CUIT y dirección. Desde ahí nace toda la trazabilidad.",shot:"client"},
 {I:PackageCheck,k:"ACTIVO",t:"2. Asociás el equipo",d:"Marca, modelo, serie, ubicación y QR individual para consultar historial.",shot:"asset"},
 {I:ClipboardCheck,k:"ORDEN",t:"3. Programás el trabajo",d:"Fecha, técnico, prioridad, materiales y checklist en una sola orden.",shot:"order"},
 {I:Camera,k:"CAMPO",t:"4. El técnico documenta",d:"GPS, horarios, checklist y fotos Antes / Durante / Después desde el celular.",shot:"field"},
 {I:FileCheck2,k:"CIERRE",t:"5. Emitís la constancia",d:"Firma, documento, evidencia, QR, PDF, garantía y próximo service.",shot:"cert"},
 {I:ReceiptText,k:"COBRO",t:"6. Cobrás y seguís el saldo",d:"Pagos, Mercado Pago, recibos y cuenta corriente del cliente.",shot:"pay"},
];

function MiniShot({shot}:{shot:string}){
 if(shot==="client")return <div className="faq-shot"><div className="faq-shot-top">Cliente · Metalúrgica Norte</div><div className="faq-shot-kpis"><span><b>3</b>Activos</span><span><b>8</b>Trabajos</span><span><b>$95k</b>Saldo</span></div><div className="faq-shot-row"><span>MN</span><div><b>Metalúrgica Norte</b><small>Ficha 360°</small></div></div></div>;
 if(shot==="asset")return <div className="faq-shot"><div className="faq-shot-top">Activo · A-00001</div><div className="faq-shot-row"><PackageCheck size={17}/><div><b>Compresor Atlas GA 15</b><small>Serie AC-845921 · Planta 1</small></div><em>QR</em></div><div className="faq-shot-line"/><div className="faq-shot-line short"/></div>;
 if(shot==="order")return <div className="faq-shot"><div className="faq-shot-top">OT-00001 · PROGRAMADA</div><h4>Mantenimiento preventivo</h4><div className="faq-shot-grid"><span><small>TÉCNICO</small><b>Tu equipo</b></span><span><small>HOY</small><b>14:30</b></span></div></div>;
 if(shot==="field")return <div className="faq-shot phone-mini"><div className="phone-mini-top">OT-00001 · EN CURSO</div><div className="gps-mini"><MapPin size={10}/> GPS registrado</div>{["Controlar filtro","Revisar conexiones","Prueba operativa"].map(x=><div className="check-mini" key={x}><Check size={10}/>{x}</div>)}<div className="photo-mini"><i/><i/><i/></div></div>;
 if(shot==="cert")return <div className="faq-shot doc-mini"><div className="faq-shot-top">CONSTANCIA #000001</div><h4>Mantenimiento preventivo</h4><p>Firma registrada · Documento · IP · QR</p><div className="doc-mini-bottom"><span>firma</span><em>QR</em></div></div>;
 return <div className="faq-shot pay-mini"><div className="faq-shot-top">CUENTA CORRIENTE</div><strong>$185.000</strong><div className="pay-mini-bar"><i/></div><div><span><small>ABONADO</small><b>$90.000</b></span><span><small>SALDO</small><b>$95.000</b></span></div></div>
}

export function VisualFaq(){
 return <section className="section visual-faq-section"><div className="container">
  <div className="section-intro"><div><div className="eyebrow">PREGUNTAS QUE SE ENTIENDEN VIENDO</div><h2>Así se hace cada proceso.</h2></div><p>Antes de registrarte podés ver cómo se ve el recorrido real. Sin tutoriales eternos ni pantallas genéricas.</p></div>
  <div className="visual-faq-grid">{cards.map(({I,t,d,k,shot})=><article className="visual-faq-card" key={k}><div className="visual-faq-copy"><span><I size={15}/>{k}</span><h3>{t}</h3><p>{d}</p></div><MiniShot shot={shot}/></article>)}</div>
 </div></section>
}