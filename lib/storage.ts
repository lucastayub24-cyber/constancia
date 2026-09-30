import { DeleteObjectsCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function client() {
  if (!process.env.R2_ENDPOINT || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY || !process.env.R2_BUCKET) {
    throw new Error("Storage R2 no configurado");
  }
  return new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT,
    credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY },
  });
}

export async function presignPhotoUpload(key: string, contentType: string, size: number) {
  if (size > 8 * 1024 * 1024) throw new Error("La foto supera 8 MB");
  if (!["image/jpeg","image/png","image/webp"].includes(contentType)) throw new Error("Formato de imagen no permitido");
  const command = new PutObjectCommand({ Bucket: process.env.R2_BUCKET!, Key: key, ContentType: contentType, ContentLength: size });
  return getSignedUrl(client(), command, { expiresIn: 900 });
}

export async function signedPhotoUrl(key: string) {
  const command = new GetObjectCommand({ Bucket: process.env.R2_BUCKET!, Key: key });
  return getSignedUrl(client(), command, { expiresIn: 3600 });
}

export async function deleteStoredObjects(keys:string[]) {
  if(keys.length===0)return;
  const s3=client();
  for(let i=0;i<keys.length;i+=1000){
    const chunk=keys.slice(i,i+1000);
    await s3.send(new DeleteObjectsCommand({
      Bucket:process.env.R2_BUCKET!,
      Delete:{Objects:chunk.map(Key=>({Key})),Quiet:true}
    }));
  }
}
