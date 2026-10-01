import Link from "next/link";
import {CheckCircle2,Clock3,XCircle} from "lucide-react";
import {PublicNav} from "@/components/PublicNav";
import {Footer} from "@/components/Footer";

export default async function PaymentResult({searchParams}:{searchParams:Promise<{status?:string}>}){
  const{status}=await searchParams;
  const state=status==="success"?"success":status==="pending"?"pending":"failure";
  const config={
    success:{Icon:CheckCircle2,title:"Pago recibido",text:"Mercado Pago informó que el pago fue aprobado. Constancia lo conciliará automáticamente en la constancia correspondiente."},
    pending:{Icon:Clock3,title:"Pago en proceso",text:"El pago quedó pendiente de acreditación. Cuando Mercado Pago lo confirme, el saldo se actualizará automáticamente."},
    failure:{Icon:XCircle,title:"El pago no se completó",text:"Mercado Pago no confirmó el cobro. Podés volver al link de pago e intentarlo nuevamente."},
  }[state];
  const Icon=config.Icon;
  return <><PublicNav/><main className="payment-result-page"><section className={"payment-result-card "+state}><div className="payment-result-icon"><Icon size={30}/></div><div className="eyebrow">CONSTANCIA · MERCADO PAGO</div><h1>{config.title}</h1><p>{config.text}</p><div className="actions" style={{justifyContent:"center"}}><Link className="btn btn-brand" href="/login">Ingresar a Constancia</Link><Link className="btn btn-light" href="/">Volver al inicio</Link></div></section></main><Footer/></>
}