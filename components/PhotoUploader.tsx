"use client";
import { useState } from "react";

type Item = { key: string; url: string };

async function compressImage(file: File) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error("Usá imágenes JPG, PNG o WEBP.");
  if (file.size > 12 * 1024 * 1024) throw new Error("Cada foto debe pesar menos de 12 MB.");

  const bitmap = await createImageBitmap(file);
  let width = bitmap.width;
  let height = bitmap.height;
  const ratio = Math.min(1, 1400 / Math.max(width, height));
  width = Math.max(1, Math.round(width * ratio));
  height = Math.max(1, Math.round(height * ratio));

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No pudimos procesar la imagen.");

  for (let attempt = 0; attempt < 6; attempt++) {
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(bitmap, 0, 0, width, height);
    const quality = Math.max(0.42, 0.76 - attempt * 0.07);
    const data = canvas.toDataURL("image/jpeg", quality);
    if (data.length <= 450000) {
      bitmap.close();
      return data;
    }
    width = Math.max(700, Math.round(width * 0.86));
    height = Math.max(500, Math.round(height * 0.86));
  }
  bitmap.close();
  throw new Error("No pudimos comprimir una de las fotos lo suficiente.");
}

export function PhotoUploader({ onChange }: { onChange: (keys: string[]) => void }) {
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function select(files: FileList | null) {
    if (!files) return;
    setBusy(true);
    setError("");
    try {
      const chosen = Array.from(files).slice(0, 6 - items.length);
      const added: Item[] = [];
      for (const file of chosen) {
        const data = await compressImage(file);
        added.push({ key: data, url: data });
      }
      const next = [...items, ...added];
      setItems(next);
      onChange(next.map((x) => x.key));
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron procesar las fotos");
    } finally {
      setBusy(false);
    }
  }

  function remove(key: string) {
    const next = items.filter((x) => x.key !== key);
    setItems(next);
    onChange(next.map((x) => x.key));
  }

  return <div>
    <label className="field">
      Fotos del trabajo
      <input className="input" type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={busy || items.length >= 6} onChange={(e) => select(e.target.files)} />
      <small className="muted">Hasta 6 fotos. Se comprimen automáticamente antes de guardarse.</small>
    </label>
    {busy && <div className="muted" style={{fontSize:11}}>Procesando fotos...</div>}
    {error && <div className="error">{error}</div>}
    {items.length > 0 && <div className="photo-grid" style={{marginTop:10}}>
      {items.map((x,index)=><div key={index} style={{position:"relative"}}>
        <img src={x.url} alt={"Evidencia "+(index+1)} />
        <button type="button" className="btn btn-danger" style={{position:"absolute",right:5,top:5,padding:6}} onClick={()=>remove(x.key)}>Quitar</button>
      </div>)}
    </div>}
  </div>;
}
