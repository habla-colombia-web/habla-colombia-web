"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const MAX_BYTES = 5 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function ImageUploader({
  folder,
  onUploaded,
}: {
  folder: string;
  onUploaded: (url: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!TYPES.includes(file.type)) {
      setError("Usa una imagen JPG, PNG o WEBP.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("La imagen supera los 5 MB.");
      return;
    }
    setBusy(true);
    setError(null);
    const ext =
      file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const sb = createClient();
    const { error: upErr } = await sb.storage
      .from("site-images")
      .upload(path, file, { cacheControl: "31536000", contentType: file.type });
    if (upErr) {
      setBusy(false);
      setError("No se pudo subir la imagen.");
      return;
    }
    const { data } = sb.storage.from("site-images").getPublicUrl(path);
    setBusy(false);
    onUploaded(data.publicUrl);
  }

  return (
    <div>
      <label className="inline-block cursor-pointer rounded-full border border-navy px-4 py-2 text-sm font-semibold text-navy hover:bg-black/5">
        {busy ? "Subiendo..." : "Subir imagen"}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={busy}
          onChange={onChange}
          className="sr-only"
        />
      </label>
      {error && (
        <p role="alert" className="mt-2 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}