import QRCode from "qrcode";
import { PDFDocument, StandardFonts, rgb, type PDFPage, type PDFFont } from "pdf-lib";
import type { Prisma } from "@prisma/client";
import { appUrl, moneyCents } from "@/lib/utils";
import { signedPhotoUrl } from "@/lib/storage";

type CertificateData=Prisma.CertificateGetPayload<{include:{organization:true;client:true;photos:true;servicePayments:true}}>;

const methodLabels={
  CASH:"Efectivo",
  BANK_TRANSFER:"Transferencia",
  MERCADO_PAGO:"Mercado Pago",
  DEBIT_CARD:"Tarjeta de débito",
  CREDIT_CARD:"Tarjeta de crédito",
  CHECK:"Cheque",
  OTHER:"Otro"
} as const;

const A4:[number,number]=[595.28,841.89];
const ink=rgb(0.09,0.13,0.11);
const muted=rgb(0.40,0.46,0.42);
const green=rgb(0.14,0.48,0.31);
const greenSoft=rgb(0.90,0.95,0.91);
const line=rgb(0.85,0.87,0.84);
const dark=rgb(0.09,0.14,0.11);

function safe(value:string|null|undefined){
  return (value||"").replace(/[\u{1F000}-\u{1FAFF}]/gu,"").replace(/[\u200B-\u200D\uFEFF]/g,"");
}

function wrap(font:PDFFont,text:string,size:number,maxWidth:number){
  const words=safe(text).split(/\s+/).filter(Boolean);
  const lines:string[]=[];
  let current="";
  for(const word of words){
    const test=current?current+" "+word:word;
    if(font.widthOfTextAtSize(test,size)<=maxWidth)current=test;
    else{
      if(current)lines.push(current);
      current=word;
    }
  }
  if(current)lines.push(current);
  return lines.length?lines:[""];
}

function drawWrapped(page:PDFPage,font:PDFFont,text:string,x:number,y:number,maxWidth:number,size=9,lineHeight=12,color=ink){
  const lines=wrap(font,text,size,maxWidth);
  lines.forEach((lineText,index)=>page.drawText(lineText,{x,y:y-index*lineHeight,size,font,color}));
  return y-lines.length*lineHeight;
}

function drawLabel(page:PDFPage,font:PDFFont,label:string,x:number,y:number){
  page.drawText(safe(label).toUpperCase(),{x,y,size:6.8,font,color:muted});
}

async function imagePayload(src:string){
  if(src.startsWith("data:image/")){
    const match=src.match(/^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/i);
    if(!match)return null;
    const type=match[1].toLowerCase();
    return {bytes:Buffer.from(match[2],"base64"),type};
  }
  const response=await fetch(src,{cache:"no-store"});
  if(!response.ok)return null;
  const type=(response.headers.get("content-type")||"").toLowerCase();
  const bytes=Buffer.from(await response.arrayBuffer());
  return {bytes,type:type.includes("png")?"png":"jpeg"};
}

async function embedImage(pdf:PDFDocument,src:string){
  const payload=await imagePayload(src);
  if(!payload)return null;
  try{
    if(payload.type==="png")return await pdf.embedPng(payload.bytes);
    return await pdf.embedJpg(payload.bytes);
  }catch{return null}
}

export async function certificatePdfBuffer(c:CertificateData){
  const pdf=await PDFDocument.create();
  const regular=await pdf.embedFont(StandardFonts.Helvetica);
  const bold=await pdf.embedFont(StandardFonts.HelveticaBold);
  let page=pdf.addPage(A4);
  let y=790;

  const addPage=()=>{
    page=pdf.addPage(A4);
    y=790;
    page.drawText("CONSTANCIA",{x:38,y,size:13,font:bold,color:ink});
    y-=28;
  };

  const ensure=(height:number)=>{
    if(y-height<55)addPage();
  };

  page.drawRectangle({x:28,y:750,width:539,height:62,color:dark});
  page.drawText("CONSTANCIA",{x:44,y:783,size:20,font:bold,color:rgb(1,1,1)});
  page.drawText("REGISTRO DE SERVICIO",{x:44,y:766,size:7,font:bold,color:rgb(0.61,0.84,0.70)});
  page.drawText("VERIFICADA",{x:474,y:784,size:7,font:bold,color:rgb(0.51,0.88,0.67)});
  page.drawText("N.º "+String(c.sequentialNumber).padStart(6,"0"),{x:463,y:766,size:9,font:bold,color:rgb(1,1,1)});
  y=725;

  drawLabel(page,regular,"Emitida por",38,y);y-=15;
  page.drawText(safe(c.organization.name),{x:38,y,size:14,font:bold,color:ink});y-=14;
  const orgLine=[c.organization.legalName,c.organization.cuit?"CUIT "+c.organization.cuit:null].filter(Boolean).join(" · ");
  if(orgLine){page.drawText(safe(orgLine),{x:38,y,size:8,font:regular,color:muted});y-=14}
  page.drawLine({start:{x:38,y},end:{x:557,y},thickness:0.7,color:line});y-=18;

  drawLabel(page,regular,"Cliente",38,y);
  drawLabel(page,regular,"Fecha del servicio",330,y);y-=15;
  page.drawText(safe(c.client?.name||"—"),{x:38,y,size:10,font:bold,color:ink});
  page.drawText(c.performedAt.toLocaleDateString("es-AR"),{x:330,y,size:10,font:bold,color:ink});y-=14;
  if(c.client?.taxId){page.drawText(safe(c.client.taxId),{x:38,y,size:8,font:regular,color:muted});y-=10}
  page.drawLine({start:{x:38,y},end:{x:557,y},thickness:0.7,color:line});y-=18;

  ensure(100);
  drawLabel(page,regular,"Trabajo realizado",38,y);y-=18;
  y=drawWrapped(page,bold,c.serviceTitle,38,y,519,16,19,ink)-4;
  y=drawWrapped(page,regular,c.description,38,y,519,9,13,muted)-4;
  if(c.observations){
    ensure(55);
    const obsLines=wrap(regular,c.observations,8.5,491);
    const h=24+obsLines.length*11;
    page.drawRectangle({x:38,y:y-h+8,width:519,height:h,color:rgb(0.95,0.96,0.94)});
    drawLabel(page,regular,"Observaciones",50,y-7);
    y=drawWrapped(page,regular,c.observations,50,y-22,491,8.5,11,muted)-10;
  }
  page.drawLine({start:{x:38,y},end:{x:557,y},thickness:0.7,color:line});y-=18;

  const paid=c.servicePayments.reduce((s,p)=>s+p.amountCents,0n);
  const outstanding=c.totalAmountCents===null?null:c.totalAmountCents>paid?c.totalAmountCents-paid:0n;

  if(c.totalAmountCents!==null){
    ensure(110);
    drawLabel(page,regular,"Cobro del trabajo",38,y);y-=15;
    const boxes=[
      ["Importe total",moneyCents(c.totalAmountCents,c.currency)],
      ["Abonado",moneyCents(paid,c.currency)],
      ["Saldo",moneyCents(outstanding,c.currency)]
    ];
    boxes.forEach((box,i)=>{
      const x=38+i*174;
      page.drawRectangle({x,y:y-42,width:164,height:42,color:rgb(0.95,0.96,0.94)});
      drawLabel(page,regular,box[0],x+9,y-13);
      page.drawText(safe(box[1]),{x:x+9,y:y-31,size:10,font:bold,color:ink});
    });
    y-=55;
    const paymentState=c.paymentStatus==="PAID"?"PAGADO":c.paymentStatus==="PARTIAL"?"PAGO PARCIAL":"PENDIENTE";
    page.drawText(paymentState,{x:38,y,size:8,font:bold,color:green});y-=13;
    if(c.paymentDueDate&&c.paymentStatus!=="PAID"){
      page.drawText("Vencimiento del saldo: "+c.paymentDueDate.toLocaleDateString("es-AR"),{x:38,y,size:8,font:regular,color:muted});y-=13;
    }
    for(const payment of c.servicePayments){
      ensure(18);
      const left=payment.paidAt.toLocaleDateString("es-AR")+" · "+methodLabels[payment.method]+(payment.reference?" · "+payment.reference:"");
      page.drawText(safe(left),{x:38,y,size:7.5,font:regular,color:muted});
      const amount=moneyCents(payment.amountCents,c.currency);
      page.drawText(safe(amount),{x:470,y,size:8,font:bold,color:ink});y-=12;
    }
    page.drawLine({start:{x:38,y},end:{x:557,y},thickness:0.7,color:line});y-=18;
  }

  const photoSources=await Promise.all(c.photos.sort((a,b)=>a.sortOrder-b.sortOrder).map(p=>signedPhotoUrl(p.storageKey).catch(()=>null)));
  const images=[];
  for(const src of photoSources.filter(Boolean) as string[]){
    const embedded=await embedImage(pdf,src);
    if(embedded)images.push(embedded);
  }
  if(images.length){
    ensure(190);
    drawLabel(page,regular,"Evidencia fotográfica",38,y);y-=15;
    const w=250,h=145,gap=12;
    for(let i=0;i<images.length;i++){
      if(i>0&&i%2===0){y-=h+gap;ensure(h+25)}
      const x=38+(i%2)*(w+12);
      const img=images[i];
      const scale=Math.min(w/img.width,h/img.height);
      const dw=img.width*scale,dh=img.height*scale;
      page.drawRectangle({x,y:y-h,width:w,height:h,color:rgb(0.97,0.97,0.96)});
      page.drawImage(img,{x:x+(w-dw)/2,y:y-h+(h-dh)/2,width:dw,height:dh});
    }
    y-=h+20;
    page.drawLine({start:{x:38,y},end:{x:557,y},thickness:0.7,color:line});y-=18;
  }

  ensure(70);
  drawLabel(page,regular,"Técnico",38,y);
  drawLabel(page,regular,"Recibido por",330,y);y-=15;
  page.drawText(safe(c.technicianName||"—"),{x:38,y,size:9,font:bold,color:ink});
  page.drawText(safe(c.signatureName||"—"),{x:330,y,size:9,font:bold,color:ink});y-=18;

  if(c.signatureDataUrl){
    const signature=await embedImage(pdf,c.signatureDataUrl);
    if(signature){
      ensure(100);
      drawLabel(page,regular,"Conformidad",38,y);y-=10;
      const scale=Math.min(220/signature.width,75/signature.height);
      page.drawImage(signature,{x:38,y:y-signature.height*scale,width:signature.width*scale,height:signature.height*scale});
      y-=82;
    }
  }

  if(c.nextServiceAt){
    ensure(55);
    page.drawRectangle({x:38,y:y-42,width:519,height:42,color:greenSoft});
    drawLabel(page,regular,"Próximo service sugerido",50,y-13);
    page.drawText(c.nextServiceAt.toLocaleDateString("es-AR"),{x:50,y:y-31,size:10,font:bold,color:green});
    y-=58;
  }

  ensure(105);
  const verificationUrl=appUrl("/v/"+c.code);
  const qrData=await QRCode.toDataURL(verificationUrl,{margin:1,width:280,errorCorrectionLevel:"M"});
  const qr=await embedImage(pdf,qrData);
  page.drawLine({start:{x:38,y},end:{x:557,y},thickness:0.7,color:line});y-=16;
  page.drawText("REGISTRO COMERCIAL VERIFICABLE",{x:38,y,size:7.5,font:bold,color:green});
  page.drawText("ID "+c.code,{x:38,y:y-13,size:7,font:regular,color:muted});
  y=drawWrapped(page,regular,verificationUrl,38,y-25,405,6.8,9,muted);
  if(qr)page.drawImage(qr,{x:474,y:y+4,width:76,height:76});
  y-=22;
  drawWrapped(page,regular,"Este documento verifica un registro comercial emitido mediante Constancia. No constituye firma digital certificada ni reemplaza certificados oficiales exigidos por normativa específica.",38,y,519,6.3,9,muted);

  const bytes=await pdf.save();
  return Buffer.from(bytes);
}
