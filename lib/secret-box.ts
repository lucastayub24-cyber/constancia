import {createCipheriv,createDecipheriv,createHash,randomBytes} from "crypto";

function key(){
  const secret=process.env.MERCADOPAGO_CLIENT_SECRET;
  if(!secret)throw new Error("MERCADOPAGO_CLIENT_SECRET no configurado");
  return createHash("sha256").update(secret).digest();
}

export function encryptSecret(value:string){
  const iv=randomBytes(12);
  const cipher=createCipheriv("aes-256-gcm",key(),iv);
  const encrypted=Buffer.concat([cipher.update(value,"utf8"),cipher.final()]);
  const tag=cipher.getAuthTag();
  return Buffer.concat([iv,tag,encrypted]).toString("base64url");
}

export function decryptSecret(value:string){
  const raw=Buffer.from(value,"base64url");
  const iv=raw.subarray(0,12),tag=raw.subarray(12,28),encrypted=raw.subarray(28);
  const decipher=createDecipheriv("aes-256-gcm",key(),iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted),decipher.final()]).toString("utf8");
}
