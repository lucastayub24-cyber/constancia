import { Plan } from "@prisma/client";
import { PLAN_INFO } from "@/lib/plans";
import { appUrl } from "@/lib/utils";
const API="https://api.mercadopago.com";
function token(){if(!process.env.MERCADOPAGO_ACCESS_TOKEN)throw new Error("MERCADOPAGO_ACCESS_TOKEN no configurado");return process.env.MERCADOPAGO_ACCESS_TOKEN}
async function mp<T>(path:string,init?:RequestInit):Promise<T>{const res=await fetch(`${API}${path}`,{...init,headers:{Authorization:`Bearer ${token()}`,"Content-Type":"application/json",...(init?.headers||{})},cache:"no-store"});const body=await res.json().catch(()=>({}));if(!res.ok)throw new Error(`Mercado Pago ${res.status}: ${JSON.stringify(body)}`);return body as T}
export async function createSubscription(plan:Exclude<Plan,"FREE">,email:string,organizationId:string){const info=PLAN_INFO[plan];return mp<{id:string;init_point?:string;status:string}>("/preapproval",{method:"POST",body:JSON.stringify({reason:`Constancia ${info.name}`,external_reference:organizationId,payer_email:email,back_url:appUrl("/dashboard/facturacion?mp=return"),auto_recurring:{frequency:1,frequency_type:"months",transaction_amount:info.monthly,currency_id:"ARS"},status:"pending"})})}
export function getSubscription(id:string){return mp<any>(`/preapproval/${encodeURIComponent(id)}`)}
export function cancelSubscription(id:string){return mp<any>(`/preapproval/${encodeURIComponent(id)}`,{method:"PUT",body:JSON.stringify({status:"cancelled"})})}
